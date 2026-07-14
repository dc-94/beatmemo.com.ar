// src/actions/pub.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { pubItemSchema } from "@/lib/validations/pub";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-logger";
import { ADMIN_ROLES } from "@/lib/auth-roles";

export interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}


// ============================================================================
// UPSERT (CREAR O EDITAR ITEM DEL PUB)
// ============================================================================
export async function upsertPubItem(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. SEGURIDAD: sesión activa
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "No autorizado. Sesión inválida." };
    }

    // 2. SEGURIDAD: rol
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !ADMIN_ROLES.includes(roleData.role)) {
      await logAdminAction(
        id ? "UNAUTHORIZED_UPDATE_PUB_ATTEMPT" : "UNAUTHORIZED_CREATE_PUB_ATTEMPT",
        "pub",
        user.id,
        { email: user.email, target_id: id },
        id ?? null
      );
      return { success: false, error: "No tienes permisos para modificar el menú." };
    }

    // 3. PARSEO SEGURO: los checkboxes llegan como 'true'/'on'/ausente; normalizamos.
    const rawData = Object.fromEntries(formData.entries()) as Record<string, any>;
const BOOL_FIELDS = ["es_vegetariano", "es_vegano", "es_sin_tacc", "es_nuevo", "es_recomendado", "destacado_home", "disponible"];
    for (const field of BOOL_FIELDS) {
      rawData[field] = rawData[field] === "true" || rawData[field] === "on";
    }

    // 4. VALIDACIÓN ZOD
    const validated = pubItemSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "Por favor, revisa los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    let dbError;
    let saved;

    // 5. INSERT O UPDATE
    if (id) {
      const { data, error } = await supabase
        .from("pub")
        .update(validated.data)
        .eq("id", id)
        .select("id, nombre")
        .single();
      dbError = error;
      saved = data;
    } else {
      const { data, error } = await supabase
        .from("pub")
        .insert(validated.data)
        .select("id, nombre")
        .single();
      dbError = error;
      saved = data;
    }

    if (dbError) {
      console.error("[DB ERROR UPSERT PUB]:", dbError);
      return { success: false, error: "Error interno al guardar en la base de datos." };
    }

    // 6. AUDITORÍA
    await logAdminAction(
      id ? "UPDATE_PUB_ITEM" : "CREATE_PUB_ITEM",
      "pub",
      user.id,
      { email: user.email, item_nombre: saved?.nombre },
      saved?.id ?? null
    );

    // 7. REVALIDACIÓN
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
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "No autorizado. Sesión inválida." };
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !ADMIN_ROLES.includes(roleData.role)) {
      await logAdminAction(
        "UNAUTHORIZED_DELETE_PUB_ATTEMPT",
        "pub",
        user.id,
        { email: user.email },
        itemId
      );
      return { success: false, error: "No tienes permisos para eliminar items del menú." };
    }

    // Soft delete: preserva el registro y el historial de auditoría.
    const { error } = await supabase
      .from("pub")
      .update({ is_deleted: true })
      .eq("id", itemId);

    if (error) {
      console.error("[DB ERROR DELETE PUB]:", error);
      return { success: false, error: "Error en la base de datos al eliminar el item." };
    }

    await logAdminAction(
      "SOFT_DELETE_PUB_ITEM",
      "pub",
      user.id,
      { email: user.email },
      itemId
    );

    revalidatePath("/admin/gastronomia");
    revalidatePath("/pub");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR PUB]:", error);
    return { success: false, error: "Error inesperado de servidor al eliminar." };
  }
}