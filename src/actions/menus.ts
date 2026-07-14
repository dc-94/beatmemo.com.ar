// src/actions/menus.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-logger";
import { z } from "zod";
import { ADMIN_ROLES } from "@/lib/auth-roles";

export interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}


// El slug/tipo es la identidad de la carta y el nombre del archivo: inmutable-friendly.
const menuSchema = z.object({
  tipo: z.string().min(1).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  url_archivo: z.string().url("Falta subir el PDF"),
  orden: z.coerce.number().int().default(0),
  activo: z.boolean().default(true),
});

// ============================================================================
// UPSERT CARTA
// ============================================================================
export async function upsertMenu(formData: FormData, id?: string): Promise<ActionResponse> {
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
        id ? "UNAUTHORIZED_UPDATE_MENU_ATTEMPT" : "UNAUTHORIZED_CREATE_MENU_ATTEMPT",
        "menus",
        user.id,
        { email: user.email, target_id: id },
        id ?? null
      );
      return { success: false, error: "No tenés permisos para gestionar cartas." };
    }

    const rawData = Object.fromEntries(formData.entries()) as Record<string, any>;
    rawData.activo = rawData.activo === "true" || rawData.activo === "on";

    const validated = menuSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "Revisá los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    let dbError;
    let saved;

    if (id) {
      // El trigger bump_menu_version incrementa version SOLO si cambió url_archivo.
      const { data, error } = await supabase
        .from("menus")
        .update(validated.data)
        .eq("id", id)
        .select("id, nombre")
        .single();
      dbError = error;
      saved = data;
    } else {
      const { data, error } = await supabase
        .from("menus")
        .insert(validated.data)
        .select("id, nombre")
        .single();
      dbError = error;
      saved = data;
    }

    if (dbError) {
      console.error("[DB ERROR UPSERT MENU]:", dbError);
      // El error más probable: tipo duplicado (UNIQUE). Lo traducimos.
      if (dbError.code === "23505") {
        return { success: false, error: "Ya existe una carta con ese identificador." };
      }
      return { success: false, error: "Error al guardar la carta." };
    }

    await logAdminAction(
      id ? "UPDATE_MENU" : "CREATE_MENU",
      "menus",
      user.id,
      { email: user.email, menu_nombre: saved?.nombre },
      saved?.id ?? null
    );

    revalidatePath("/admin/menus");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL MENU]:", error);
    return { success: false, error: "Error inesperado de servidor." };
  }
}

// ============================================================================
// DELETE CARTA (soft delete)
// ============================================================================
export async function deleteMenu(menuId: string): Promise<ActionResponse> {
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
        "UNAUTHORIZED_DELETE_MENU_ATTEMPT",
        "menus",
        user.id,
        { email: user.email },
        menuId
      );
      return { success: false, error: "No tenés permisos para eliminar cartas." };
    }

    const { error } = await supabase
      .from("menus")
      .update({ is_deleted: true })
      .eq("id", menuId);

    if (error) {
      console.error("[DB ERROR DELETE MENU]:", error);
      return { success: false, error: "Error al eliminar la carta." };
    }

    await logAdminAction(
      "SOFT_DELETE_MENU",
      "menus",
      user.id,
      { email: user.email },
      menuId
    );

    revalidatePath("/admin/menus");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL MENU]:", error);
    return { success: false, error: "Error inesperado al eliminar." };
  }
}

// ============================================================================
// REORDENAR (persiste el nuevo orden de varias cartas de una)
// Recibe un array de { id, orden } — lo usa el botón "Guardar" tras las flechas ↑↓.
// ============================================================================
export async function reorderMenus(
  ordenados: { id: string; orden: number }[]
): Promise<ActionResponse> {
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
      return { success: false, error: "No tenés permisos para reordenar cartas." };
    }

    // Actualización por lote. Cada update es chico; con pocas cartas es trivial.
    for (const item of ordenados) {
      const { error } = await supabase
        .from("menus")
        .update({ orden: item.orden })
        .eq("id", item.id);
      if (error) {
        console.error("[DB ERROR REORDER MENU]:", error);
        return { success: false, error: "Error al guardar el orden." };
      }
    }

    await logAdminAction(
      "REORDER_MENUS",
      "menus",
      user.id,
      { email: user.email, count: ordenados.length }
    );

    revalidatePath("/admin/menus");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL MENU]:", error);
    return { success: false, error: "Error inesperado al reordenar." };
  }
}