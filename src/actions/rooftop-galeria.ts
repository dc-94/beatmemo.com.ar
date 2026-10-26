// src/actions/rooftop-galeria.ts
"use server";

import { revalidatePath } from "next/cache";
import { galeriaSchema, reorderGaleriaSchema } from "@/lib/validations/rooftop-galeria";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function upsertGaleria(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPSERT_ROOFTOP_GALERIA", table: "rooftop_galeria" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const id = (formData.get("id") as string) || null;
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.activo = raw.activo === "true" || raw.activo === "on";

    const validated = galeriaSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }
    const d = validated.data;
    const payload = { imagen_url: d.imagen_url, subtitulo: d.subtitulo, ancho: d.ancho, alto: d.alto, orden: d.orden, activo: d.activo };

    const { data: saved, error } = id
      ? await supabase.from("rooftop_galeria").update(payload).eq("id", id).select("id").single()
      : await supabase.from("rooftop_galeria").insert(payload).select("id").single();

    if (error || !saved) { console.error("[DB ERROR GALERIA]:", error); return { success: false, error: "No se pudo guardar." }; }

    await logAdminAction(id ? "UPDATE_ROOFTOP_GALERIA" : "CREATE_ROOFTOP_GALERIA", "rooftop_galeria", user.id, { email: user.email }, saved.id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true, newId: saved.id };
  } catch (e) { console.error("[GALERIA FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function deleteGaleria(id: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_ROOFTOP_GALERIA", table: "rooftop_galeria", targetId: id });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase.from("rooftop_galeria").update({ is_deleted: true }).eq("id", id);
    if (error) { console.error("[DB ERROR DELETE GALERIA]:", error); return { success: false, error: "No se pudo eliminar." }; }

    await logAdminAction("SOFT_DELETE_ROOFTOP_GALERIA", "rooftop_galeria", user.id, { email: user.email }, id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[DELETE GALERIA FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function reorderGaleria(ordenados: { id: string; orden: number }[]): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "REORDER_ROOFTOP_GALERIA", table: "rooftop_galeria" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const validated = reorderGaleriaSchema.safeParse(ordenados);
    if (!validated.success) return { success: false, error: "Datos de orden inválidos." };

    const { error } = await supabase.rpc("reorder_rooftop", { tabla: "rooftop_galeria", items: validated.data });
    if (error) { console.error("[DB ERROR REORDER GALERIA]:", error); return { success: false, error: "Error al guardar el orden." }; }

    await logAdminAction("REORDER_ROOFTOP_GALERIA", "rooftop_galeria", user.id, { email: user.email, count: validated.data.length });
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[GALERIA FATAL]:", e); return { success: false, error: "Error inesperado al reordenar." }; }
}