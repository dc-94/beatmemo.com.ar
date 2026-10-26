// src/actions/rooftop-tipos-evento.ts
"use server";

import { revalidatePath } from "next/cache";
import { tipoEventoSchema, reorderTiposSchema } from "@/lib/validations/rooftop-tipos-evento";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function upsertTipoEvento(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPSERT_ROOFTOP_TIPO_EVENTO", table: "rooftop_tipos_evento" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const id = (formData.get("id") as string) || null;
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.activo = raw.activo === "true" || raw.activo === "on";
    // imagenes viaja como JSON string desde el form (FormData no lleva arrays).
    try {
      raw.imagenes = raw.imagenes ? JSON.parse(raw.imagenes as string) : [];
    } catch {
      return { success: false, error: "Las imágenes tienen un formato inválido." };
    }

    const validated = tipoEventoSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const d = validated.data;
    const payload = {
      titulo_strong: d.titulo_strong,
      titulo_light: d.titulo_light,
      descripcion: d.descripcion,
      imagenes: d.imagenes,
      orden: d.orden,
      activo: d.activo,
    };

    const { data: saved, error } = id
      ? await supabase.from("rooftop_tipos_evento").update(payload).eq("id", id).select("id").single()
      : await supabase.from("rooftop_tipos_evento").insert(payload).select("id").single();

    if (error || !saved) { console.error("[DB ERROR TIPO EVENTO]:", error); return { success: false, error: "No se pudo guardar." }; }

    await logAdminAction(id ? "UPDATE_ROOFTOP_TIPO_EVENTO" : "CREATE_ROOFTOP_TIPO_EVENTO", "rooftop_tipos_evento", user.id, { email: user.email }, saved.id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true, newId: saved.id };
  } catch (e) { console.error("[TIPO EVENTO FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function deleteTipoEvento(id: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_ROOFTOP_TIPO_EVENTO", table: "rooftop_tipos_evento", targetId: id });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase.from("rooftop_tipos_evento").update({ is_deleted: true }).eq("id", id);
    if (error) { console.error("[DB ERROR DELETE TIPO EVENTO]:", error); return { success: false, error: "No se pudo eliminar." }; }

    await logAdminAction("SOFT_DELETE_ROOFTOP_TIPO_EVENTO", "rooftop_tipos_evento", user.id, { email: user.email }, id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[DELETE TIPO EVENTO FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function reorderTiposEvento(ordenados: { id: string; orden: number }[]): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "REORDER_ROOFTOP_TIPOS_EVENTO", table: "rooftop_tipos_evento" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const validated = reorderTiposSchema.safeParse(ordenados);
    if (!validated.success) return { success: false, error: "Datos de orden inválidos." };

    const { error } = await supabase.rpc("reorder_rooftop_tipos_evento", { items: validated.data });
    if (error) { console.error("[DB ERROR REORDER TIPO EVENTO]:", error); return { success: false, error: "Error al guardar el orden." }; }

    await logAdminAction("REORDER_ROOFTOP_TIPOS_EVENTO", "rooftop_tipos_evento", user.id, { email: user.email, count: validated.data.length });
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[TIPO EVENTO FATAL]:", e); return { success: false, error: "Error inesperado al reordenar." }; }
}