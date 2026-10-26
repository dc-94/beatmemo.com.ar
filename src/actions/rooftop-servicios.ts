// src/actions/rooftop-servicios.ts
"use server";

import { revalidatePath } from "next/cache";
import { seccionRooftopSchema, servicioSchema, reorderSchema } from "@/lib/validations/rooftop-servicios";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

// ── Encabezado (fila keyed en rooftop_secciones) ──
export async function updateSeccionRooftop(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPDATE_ROOFTOP_SECCION", table: "rooftop_secciones" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    // imagenes viaja como JSON string (FormData no lleva arrays); solo hero la manda.
    if (typeof raw.imagenes === "string") {
      try { raw.imagenes = JSON.parse(raw.imagenes); }
      catch { return { success: false, error: "Las imágenes tienen un formato inválido." }; }
    }

    const validated = seccionRooftopSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }
    const d = validated.data;

    const { error } = await supabase.from("rooftop_secciones").upsert({
      clave: d.clave,
      titulo: d.titulo,
      subtitulo: d.subtitulo,
      cuerpo: d.cuerpo,
      imagen_url: d.imagen_url,
      cta_label: d.cta_label,
      cta_url: d.cta_url,
      imagenes: d.imagenes,
      updated_at: new Date().toISOString(),
    }, { onConflict: "clave" });

    if (error) { console.error("[DB ERROR SECCION]:", error); return { success: false, error: "No se pudo guardar." }; }

    await logAdminAction("UPDATE_ROOFTOP_SECCION", "rooftop_secciones", user.id, { email: user.email, clave: d.clave }, d.clave);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[SECCION FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

// ── Lista de servicios ──
export async function upsertServicio(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPSERT_ROOFTOP_SERVICIO", table: "rooftop_servicios" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const id = (formData.get("id") as string) || null;
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.activo = raw.activo === "true" || raw.activo === "on";

    const validated = servicioSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }
    const d = validated.data;
    const payload = { texto: d.texto, detalle: d.detalle, orden: d.orden, activo: d.activo };

    const { data: saved, error } = id
      ? await supabase.from("rooftop_servicios").update(payload).eq("id", id).select("id").single()
      : await supabase.from("rooftop_servicios").insert(payload).select("id").single();

    if (error || !saved) { console.error("[DB ERROR SERVICIO]:", error); return { success: false, error: "No se pudo guardar." }; }

    await logAdminAction(id ? "UPDATE_ROOFTOP_SERVICIO" : "CREATE_ROOFTOP_SERVICIO", "rooftop_servicios", user.id, { email: user.email }, saved.id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true, newId: saved.id };
  } catch (e) { console.error("[SERVICIO FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function deleteServicio(id: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_ROOFTOP_SERVICIO", table: "rooftop_servicios", targetId: id });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase.from("rooftop_servicios").update({ is_deleted: true }).eq("id", id);
    if (error) { console.error("[DB ERROR DELETE SERVICIO]:", error); return { success: false, error: "No se pudo eliminar." }; }

    await logAdminAction("SOFT_DELETE_ROOFTOP_SERVICIO", "rooftop_servicios", user.id, { email: user.email }, id);
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[DELETE SERVICIO FATAL]:", e); return { success: false, error: "Error inesperado." }; }
}

export async function reorderServicios(ordenados: { id: string; orden: number }[]): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "REORDER_ROOFTOP_SERVICIOS", table: "rooftop_servicios" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const validated = reorderSchema.safeParse(ordenados);
    if (!validated.success) return { success: false, error: "Datos de orden inválidos." };

    const { error } = await supabase.rpc("reorder_rooftop", { tabla: "rooftop_servicios", items: validated.data });
    if (error) { console.error("[DB ERROR REORDER SERVICIO]:", error); return { success: false, error: "Error al guardar el orden." }; }

    await logAdminAction("REORDER_ROOFTOP_SERVICIOS", "rooftop_servicios", user.id, { email: user.email, count: validated.data.length });
    revalidatePath("/admin/rooftop");
    revalidatePath("/rooftop");
    return { success: true };
  } catch (e) { console.error("[SERVICIO FATAL]:", e); return { success: false, error: "Error inesperado al reordenar." }; }
}