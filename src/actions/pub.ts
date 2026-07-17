// src/actions/pub.ts
"use server";

import { revalidatePath } from "next/cache";
import { pubItemSchema } from "@/lib/validations/pub";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

// NOTA: un archivo "use server" SOLO puede exportar funciones async.
// Nada de `export type`, `export const` ni `export interface`.
// El tipo ActionResponse se importa acá y vive en lib/guard.ts.

// ============================================================================
// UPSERT (CREAR O EDITAR ITEM DEL PUB)
// ============================================================================
export async function upsertPubItem(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    // 1. SESIÓN + RATE LIMIT + ROL
    const guard = await guardAction({
      intent: id ? "UPDATE_PUB" : "CREATE_PUB",
      table: "pub",
      targetId: id ?? null,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // 2. PARSEO SEGURO: los checkboxes llegan como 'true'/'on'/ausente.
    const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    const BOOL_FIELDS = [
      "es_vegetariano", "es_vegano", "es_sin_tacc",
      "es_nuevo", "es_recomendado", "destacado_home", "disponible",
    ];
    for (const field of BOOL_FIELDS) {
      rawData[field] = rawData[field] === "true" || rawData[field] === "on";
    }

    // 3. VALIDACIÓN ZOD
    const validated = pubItemSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "Por favor, revisa los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // 4. INSERT O UPDATE
    // El ternario devuelve el builder SIN ejecutar (Regla Crítica del thenable).
    // Se ejecuta recién en el await de abajo.
    const query = id
      ? supabase.from("pub").update(validated.data).eq("id", id).select("id, nombre").single()
      : supabase.from("pub").insert(validated.data).select("id, nombre").single();

    const { data: saved, error: dbError } = await query;

    if (dbError) {
      console.error("[DB ERROR UPSERT PUB]:", dbError);
      return { success: false, error: "Error interno al guardar en la base de datos." };
    }

    // 5. AUDITORÍA
    await logAdminAction(
      id ? "UPDATE_PUB_ITEM" : "CREATE_PUB_ITEM",
      "pub",
      user.id,
      { email: user.email, item_nombre: saved?.nombre },
      saved?.id ?? null
    );

    // 6. REVALIDACIÓN
    revalidatePath("/admin/gastronomia");
    revalidatePath("/pub");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR PUB]:", error);
    return { success: false, error: "Error inesperado de servidor. Contacta a soporte." };
  }
}

// ============================================================================
// DELETE (SOFT DELETE — marca is_deleted, no borra la fila)
// ============================================================================
export async function deletePubItem(itemId: string): Promise<ActionResponse> {
  try {
    // 1. SESIÓN + RATE LIMIT + ROL
    const guard = await guardAction({
      intent: "DELETE_PUB",
      table: "pub",
      targetId: itemId,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // 2. SOFT DELETE: preserva el registro y el historial de auditoría.
    const { error } = await supabase
      .from("pub")
      .update({ is_deleted: true })
      .eq("id", itemId);

    if (error) {
      console.error("[DB ERROR DELETE PUB]:", error);
      return { success: false, error: "Error en la base de datos al eliminar el item." };
    }

    // 3. AUDITORÍA
    await logAdminAction(
      "SOFT_DELETE_PUB_ITEM",
      "pub",
      user.id,
      { email: user.email },
      itemId
    );

    // 4. REVALIDACIÓN
    revalidatePath("/admin/gastronomia");
    revalidatePath("/pub");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR PUB]:", error);
    return { success: false, error: "Error inesperado de servidor al eliminar." };
  }
}