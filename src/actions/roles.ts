"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
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


async function tieneSudo(): Promise<boolean> {
  const c = await cookies();
  const until = Number(c.get("sudo_until")?.value ?? 0);
  return Date.now() < until;
}
// ── INVITAR / PROMOVER ────────────────────────────────────────────────
export async function invitarAdmin(formData: FormData): Promise<ActionResponse> {
  const guard = await guardAction({ intent: "INVITE_ADMIN", table: "admin_invitados", ...SUPERADMIN_ONLY });
  if (!guard.ok) return guard.response;

  const parsed = invitarSchema.safeParse({
    email: formData.get("email"),
    rol: formData.get("rol"),
  });
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, rol } = parsed.data;
  const { supabase, user } = guard;

  // Buscamos el user por email vía RPC .
  const { data: userId, error: lookupError } = await supabase.rpc("buscar_user_por_email", { p_email: email });

  if (lookupError) {
    console.error("[invitarAdmin] lookup:", lookupError);
    return { success: false, error: "No se pudo verificar el usuario." };
  }

  if (userId) {
    // Ya existe 
    const { error } = await supabase.from("user_roles").update({ role: rol }).eq("user_id", userId);
    if (error) return { success: false, error: "No se pudo actualizar el rol." };
    await logAdminAction("UPDATE_ROLE", "user_roles", user.id, { target_email: email, nuevo_rol: rol, via: "invitar-existente" }, userId);
  } else {
    // No existe aún 
    const { error } = await supabase
      .from("admin_invitados")
      .upsert({ email, rol, invitado_por: user.id }, { onConflict: "email" });
    if (error) return { success: false, error: "No se pudo guardar la invitación." };
    await logAdminAction("INVITE_ADMIN", "admin_invitados", user.id, { target_email: email, rol }, null);
  }

  revalidatePath("/admin/usuarios");
  return { success: true };
}

// ── CAMBIAR ROL (usuario existente) ───────────────────────────────────
const cambiarSchema = z.object({
  userId: z.string().uuid(),
  rol: z.enum(["CM", "SUPERADMIN", "VISITOR"]),
});

export async function cambiarRol(formData: FormData): Promise<ActionResponse> {
    const guard = await guardAction({ intent: "UPDATE_ROLE", table: "user_roles", ...SUPERADMIN_ONLY });
  if (!guard.ok) return guard.response;

  const parsed = cambiarSchema.safeParse({ userId: formData.get("userId"), rol: formData.get("rol") });
  if (!parsed.success) return { success: false, error: "Datos inválidos" };
  const { userId, rol } = parsed.data;
  const { supabase, user } = guard;

  // Anti-lockout: no podés degradarte a vos mismo.
  if (userId === user.id && rol !== "SUPERADMIN") {
    return { success: false, error: "No podés quitarte a vos mismo el rol de superadmin." };
  }

  const tocaSuperadmin = rol === "SUPERADMIN"; 
  if (tocaSuperadmin && !(await tieneSudo())) {
    return { success: false, error: "REAUTH_REQUERIDA" };
  }
  const { error } = await supabase.from("user_roles").update({ role: rol }).eq("user_id", userId);
  if (error) return { success: false, error: "No se pudo cambiar el rol." };

  await logAdminAction("UPDATE_ROLE", "user_roles", user.id, { target_user: userId, nuevo_rol: rol }, userId);
  revalidatePath("/admin/usuarios");
  return { success: true };
}

// ── REVOCAR ACCESO ────────────────────────────────────────────────────
export async function revocarAcceso(formData: FormData): Promise<ActionResponse> {
  const guard = await guardAction({ intent: "REVOKE_ADMIN", table: "user_roles", ...SUPERADMIN_ONLY });
  if (!guard.ok) return guard.response;

  const userId = formData.get("userId") as string | null;
  const email = formData.get("email") as string | null;
  const { supabase, user } = guard;

  if (userId && userId === user.id) {
    return { success: false, error: "No podés revocarte el acceso a vos mismo." };
  }

  // Baja a VISITOR (no borramos la cuenta de auth; queda logueable pero sin panel).
  if (userId) {
    const { error } = await supabase.from("user_roles").update({ role: "VISITOR" }).eq("user_id", userId);
    if (error) return { success: false, error: "No se pudo revocar el acceso." };
  }
  // Y lo sacamos de la allowlist para que un futuro re-login no lo reactive.
  if (email) {
    await supabase.from("admin_invitados").delete().eq("email", email.toLowerCase());
  }

  await logAdminAction("REVOKE_ADMIN", "user_roles", user.id, { target_user: userId, target_email: email }, userId);
  revalidatePath("/admin/usuarios");
  return { success: true };
}

// ── BORRAR invitado ────────────────────────────────────────────────────
export async function borrarInvitado(formData: FormData): Promise<ActionResponse> {
  const guard = await guardAction({ intent: "DELETE_INVITE", table: "admin_invitados", roles: ["SUPERADMIN"] });
  if (!guard.ok) return guard.response;
  const email = (formData.get("email") as string | null)?.toLowerCase();
  if (!email) return { success: false, error: "Email requerido." };

  const { error } = await guard.supabase.from("admin_invitados").delete().eq("email", email);
  if (error) return { success: false, error: "No se pudo borrar." };
  await logAdminAction("DELETE_INVITE", "admin_invitados", guard.user.id, { email }, null);
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function denegarInvitado(formData: FormData): Promise<ActionResponse> {
  const guard = await guardAction({ intent: "DENY_INVITE", table: "admin_invitados", roles: ["SUPERADMIN"] });
  if (!guard.ok) return guard.response;
  const email = (formData.get("email") as string | null)?.toLowerCase();
  if (!email) return { success: false, error: "Email requerido." };

  // upsert: si no estaba en la lista, lo agrega ya denegado; si estaba, lo marca.
  const { error } = await guard.supabase
    .from("admin_invitados")
    .upsert({ email, rol: "CM", estado: "denegado", invitado_por: guard.user.id }, { onConflict: "email" });
  if (error) return { success: false, error: "No se pudo denegar." };
  await logAdminAction("DENY_INVITE", "admin_invitados", guard.user.id, { email }, null);
  revalidatePath("/admin/usuarios");
  return { success: true };
}