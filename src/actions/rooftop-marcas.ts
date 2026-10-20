// src/actions/rooftop-marcas.ts
"use server";

import { revalidatePath } from "next/cache";
import { marcaSchema, reorderMarcasSchema } from "@/lib/validations/rooftop-marcas";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function upsertMarca(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPSERT_ROOFTOP_MARCA", table: "rooftop_marcas" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const id = (formData.get("id") as string) || null;
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.activo = raw.activo === "true" || raw.activo === "on";

    const validated = marcaSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const payload = {
      nombre: validated.data.nombre || null,
      logo_url: validated.data.logo_url,
      orden: validated.data.orden,
      activo: validated.data.activo,
    };

    const { data: saved, error } = id
      ? await supabase.from("rooftop_marcas").update(payload).eq("id", id).select("id").single()
      : await supabase.from("rooftop_marcas").insert(payload).select("id").single();

    if (error || !saved) { console.error("[DB ERROR MARCA]:", error); return { success: false, error: "No se pudo guardar." }; }

    await logAdminAction(id ? "UPDATE_ROOFTOP_MARCA" : "CREATE_ROOFTOP_MARCA", "rooftop_marcas", user.id, { email: user.email }, saved.id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true, newId: saved.id }; 
  } catch (e) { console.error("[MARCA FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function deleteMarca(id: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_ROOFTOP_MARCA", table: "rooftop_marcas", targetId: id });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase.from("rooftop_marcas").update({ is_deleted: true }).eq("id", id);
    if (error) { console.error("[DB ERROR DELETE MARCA]:", error); return { success: false, error: "No se pudo eliminar." }; }

    await logAdminAction("SOFT_DELETE_ROOFTOP_MARCA", "rooftop_marcas", user.id, { email: user.email }, id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[DELETE MARCA FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function reorderMarcas(ordenados: { id: string; orden: number }[]): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "REORDER_ROOFTOP_MARCAS", table: "rooftop_marcas" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const validated = reorderMarcasSchema.safeParse(ordenados);
    if (!validated.success) return { success: false, error: "Datos de orden inválidos." };

    for (const item of validated.data) {
      const { error } = await supabase.from("rooftop_marcas").update({ orden: item.orden }).eq("id", item.id);
      if (error) return { success: false, error: "Error al guardar el orden." };
    }

    await logAdminAction("REORDER_ROOFTOP_MARCAS", "rooftop_marcas", user.id, { email: user.email, count: validated.data.length });
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[MARCA FATAL]:", e); return { success: false, error: "Error inesperado al reordenar." }; }
}