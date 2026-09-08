"use server";

import { guardAction } from "@/lib/guard";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResponse } from "@/lib/guard";

const SUPERADMIN_ONLY = { roles: ["SUPERADMIN"] as const };

const invitarSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  rol: z.enum(["CM", "SUPERADMIN"]),
});

const cambiarSchema = z.object({
  userId: z.string().uuid(),
  rol: z.enum(["CM", "SUPERADMIN", "VISITOR"]),
});

// ── INVITAR / PROMOVER POR EMAIL ──────────────────────────────────────
// Un solo camino: si el email ya se logueó, le asigna el rol directo;
// si no, queda en la allowlist para su primer ingreso (lo lee el trigger).
export async function invitarAdmin(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "INVITE_ADMIN", table: "admin_invitados", ...SUPERADMIN_ONLY });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const parsed = invitarSchema.safeParse({
      email: formData.get("email"),
      rol: formData.get("rol"),
    });
    if (!parsed.success) {
      return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const { email, rol } = parsed.data;

    const { data: userId, error: lookupError } = await supabase.rpc("buscar_user_por_email", { p_email: email });
    if (lookupError) {
      console.error("[invitarAdmin] lookup:", lookupError);
      return { success: false, error: "No se pudo verificar el usuario." };
    }

    if (userId) {
      // Ya existe → update directo. Pedimos las filas de vuelta: si RLS bloquea
      // o el id no existe, Postgres devuelve 0 filas SIN error → hay que detectarlo.
      const { data: filas, error } = await supabase
        .from("user_roles")
        .update({ role: rol })
        .eq("user_id", userId)
        .select("user_id");

      if (error) return { success: false, error: "No se pudo actualizar el rol." };
      if (!filas || filas.length === 0) {
        return { success: false, error: "No se pudo aplicar el cambio (sin permisos o usuario inexistente)." };
      }
      await logAdminAction("UPDATE_ROLE", "user_roles", user.id, { target_email: email, nuevo_rol: rol, via: "invitar-existente" }, userId);
    } else {
      // No existe aún → allowlist para su primer login.
      const { data: filas, error } = await supabase
        .from("admin_invitados")
        .upsert({ email, rol, estado: "pendiente", invitado_por: user.id }, { onConflict: "email" })
        .select("email");

      if (error) return { success: false, error: "No se pudo guardar la invitación." };
      if (!filas || filas.length === 0) {
        return { success: false, error: "No se pudo guardar la invitación (sin permisos)." };
      }
      await logAdminAction("INVITE_ADMIN", "admin_invitados", user.id, { target_email: email, rol }, null);
    }

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    console.error("[invitarAdmin] fatal:", e);
    return { success: false, error: "Error inesperado del servidor." };
  }
}

// ── CAMBIAR ROL ───────────────────────────────────────────────────────
export async function cambiarRol(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPDATE_ROLE", table: "user_roles", ...SUPERADMIN_ONLY });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const parsed = cambiarSchema.safeParse({ userId: formData.get("userId"), rol: formData.get("rol") });
    if (!parsed.success) return { success: false, error: "Datos inválidos" };
    const { userId, rol } = parsed.data;

    // Anti-lockout: no podés degradarte a vos mismo.
    if (userId === user.id && rol !== "SUPERADMIN") {
      return { success: false, error: "No podés quitarte a vos mismo el rol de superadmin." };
    }

    const { data: filas, error } = await supabase
      .from("user_roles")
      .update({ role: rol })
      .eq("user_id", userId)
      .select("user_id");

    if (error) return { success: false, error: "No se pudo cambiar el rol." };
    // Un update de 0 filas NO es error en Postgres, pero tampoco éxito:
    // casi siempre es RLS bloqueando o un id inexistente. Antes esto devolvía
    // success y la UI mentía con un toast verde.
    if (!filas || filas.length === 0) {
      return { success: false, error: "No se pudo aplicar el cambio (sin permisos o usuario inexistente)." };
    }

    await logAdminAction("UPDATE_ROLE", "user_roles", user.id, { target_user: userId, nuevo_rol: rol }, userId);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    console.error("[cambiarRol] fatal:", e);
    return { success: false, error: "Error inesperado del servidor." };
  }
}

// ── REVOCAR ACCESO ────────────────────────────────────────────────────
export async function revocarAcceso(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "REVOKE_ADMIN", table: "user_roles", ...SUPERADMIN_ONLY });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const userId = formData.get("userId") as string | null;
    const email = formData.get("email") as string | null;

    if (userId && userId === user.id) {
      return { success: false, error: "No podés revocarte el acceso a vos mismo." };
    }

    if (userId) {
      const { data: filas, error } = await supabase
        .from("user_roles")
        .update({ role: "VISITOR" })
        .eq("user_id", userId)
        .select("user_id");

      if (error) return { success: false, error: "No se pudo revocar el acceso." };
      if (!filas || filas.length === 0) {
        return { success: false, error: "No se pudo revocar (sin permisos o usuario inexistente)." };
      }
    }

    // Sacarlo de la allowlist para que un futuro re-login no lo reactive.
    // Acá NO chequeamos filas: si no estaba en la allowlist, borrar 0 es correcto.
    if (email) {
      await supabase.from("admin_invitados").delete().eq("email", email.toLowerCase());
    }

    await logAdminAction("REVOKE_ADMIN", "user_roles", user.id, { target_user: userId, target_email: email }, userId);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    console.error("[revocarAcceso] fatal:", e);
    return { success: false, error: "Error inesperado del servidor." };
  }
}

// ── BORRAR INVITADO ───────────────────────────────────────────────────
export async function borrarInvitado(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_INVITE", table: "admin_invitados", ...SUPERADMIN_ONLY });
    if (!guard.ok) return guard.response;

    const email = (formData.get("email") as string | null)?.toLowerCase();
    if (!email) return { success: false, error: "Email requerido." };

    const { error } = await guard.supabase.from("admin_invitados").delete().eq("email", email);
    if (error) return { success: false, error: "No se pudo borrar." };

    await logAdminAction("DELETE_INVITE", "admin_invitados", guard.user.id, { email }, null);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    console.error("[borrarInvitado] fatal:", e);
    return { success: false, error: "Error inesperado del servidor." };
  }
}

// ── DENEGAR INVITADO ──────────────────────────────────────────────────
export async function denegarInvitado(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DENY_INVITE", table: "admin_invitados", ...SUPERADMIN_ONLY });
    if (!guard.ok) return guard.response;

    const email = (formData.get("email") as string | null)?.toLowerCase();
    if (!email) return { success: false, error: "Email requerido." };

    const { error } = await guard.supabase
      .from("admin_invitados")
      .upsert({ email, rol: "CM", estado: "denegado", invitado_por: guard.user.id }, { onConflict: "email" });
    if (error) return { success: false, error: "No se pudo denegar." };

    await logAdminAction("DENY_INVITE", "admin_invitados", guard.user.id, { email }, null);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (e) {
    console.error("[denegarInvitado] fatal:", e);
    return { success: false, error: "Error inesperado del servidor." };
  }
}