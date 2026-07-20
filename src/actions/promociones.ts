// src/actions/promociones.ts
"use server";

import { revalidatePath } from "next/cache";
import { promocionSchema } from "@/lib/validations/promociones";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

const BOOL_FIELDS = ["activo"];

// dias_semana llega como CSV desde el form ("2,4"). Se parsea en el schema,
// pero el array final va a un column smallint[]; Supabase lo acepta como array JS.
export async function upsertPromocion(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({
      intent: id ? "UPDATE_PROMO" : "CREATE_PROMO",
      table: "promociones",
      targetId: id ?? null,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    for (const f of BOOL_FIELDS) {
      rawData[f] = rawData[f] === "true" || rawData[f] === "on";
    }

    const validated = promocionSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "Revisá los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // Normalizamos "" → null en las columnas nullable, para no guardar
    // strings vacíos donde la semántica es "sin valor".
    const d = validated.data;
    const payload = {
      tipo: d.tipo,
      titulo: d.titulo,
      descripcion: d.descripcion || null,
      entidad: d.entidad || null,
      logo_url: d.logo_url || null,
      imagen_url: d.imagen_url || null,
      alt_texto: d.alt_texto || null,
      dias_semana: d.dias_semana.length ? d.dias_semana : null,
      fecha_desde: d.fecha_desde,
      fecha_hasta: d.fecha_hasta,
      activo: d.activo,
      prioridad: d.prioridad,
    };

    const query = id
      ? supabase.from("promociones").update(payload).eq("id", id).select("id, titulo").single()
      : supabase.from("promociones").insert(payload).select("id, titulo").single();

    const { data: saved, error: dbError } = await query;

    if (dbError) {
      console.error("[DB ERROR UPSERT PROMO]:", dbError);
      return { success: false, error: "Error al guardar la promoción." };
    }

    await logAdminAction(
      id ? "UPDATE_PROMO" : "CREATE_PROMO",
      "promociones",
      user.id,
      { email: user.email, promo_titulo: saved?.titulo },
      saved?.id ?? null
    );

    revalidatePath("/admin/promociones");
    revalidatePath("/"); // la barra vive en el home
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL PROMO]:", error);
    return { success: false, error: "Error inesperado de servidor." };
  }
}

export async function deletePromocion(promoId: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({
      intent: "DELETE_PROMO",
      table: "promociones",
      targetId: promoId,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase
      .from("promociones")
      .update({ is_deleted: true })
      .eq("id", promoId);

    if (error) {
      console.error("[DB ERROR DELETE PROMO]:", error);
      return { success: false, error: "Error al eliminar la promoción." };
    }

    await logAdminAction("SOFT_DELETE_PROMO", "promociones", user.id, { email: user.email }, promoId);

    revalidatePath("/admin/promociones");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL PROMO]:", error);
    return { success: false, error: "Error inesperado al eliminar." };
  }
}