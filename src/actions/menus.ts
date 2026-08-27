// src/actions/menus.ts
"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-logger";
import { z } from "zod";
import { guardAction, type ActionResponse } from "@/lib/guard";

// NOTA: el contrato ActionResponse vive en lib/guard.ts. Acá solo se
// exportan funciones async ("use server").

// El slug/tipo es la identidad de la carta y el nombre del archivo: inmutable-friendly.
const menuSchema = z.object({
  tipo: z.string().min(1).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  url_archivo: z.string().url("Falta subir el PDF"),
  orden: z.coerce.number().int().default(0),
  activo: z.boolean().default(true),
});

// reorderMenus recibe un array JSON directo del cliente (no FormData).
// Era la ÚNICA action con input sin validar: directiva anti-tampering aplicada.
const reorderSchema = z
  .array(
    z.object({
      id: z.string().uuid("ID de carta inválido"),
      orden: z.number().int().min(0).max(999),
    })
  )
  .min(1)
  .max(50); // techo sano: nadie tiene 50 cartas; corta payloads absurdos

// ============================================================================
// UPSERT CARTA
// ============================================================================
export async function upsertMenu(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    // 1. SESIÓN + RATE LIMIT + ROL
    const guard = await guardAction({
      intent: id ? "UPDATE_MENU" : "CREATE_MENU",
      table: "menus",
      targetId: id ?? null,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // 2. PARSEO SEGURO
    const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    rawData.activo = rawData.activo === "true" || rawData.activo === "on";

    // 3. VALIDACIÓN ZOD
    const validated = menuSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "Revisá los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // 4. INSERT O UPDATE — 
        // Al reemplazar el PDF, incrementamos version para romper el caché del CDN.
    // El visor usa este número en la URL (?v=), así el navegador ve cada
    // reemplazo como un archivo nuevo. Sin esto, el CDN sirve el PDF viejo.
 let nuevaVersion = 1;
    if (id) {
      const { data: actual } = await supabase
        .from("menus")
        .select("version")
        .eq("id", id)
        .single();
      nuevaVersion = (actual?.version ?? 0) + 1;
    }

    const nuevaData = { ...validated.data, version: nuevaVersion };

    const query = id
      ? supabase.from("menus").update(nuevaData).eq("id", id).select("id, nombre").single()
      : supabase.from("menus").insert(nuevaData).select("id, nombre").single();

    const { data: saved, error: dbError } = await query;
    if (dbError) {
      console.error("[DB ERROR UPSERT MENU]:", dbError);
      // El error más probable: tipo duplicado (UNIQUE). Lo traducimos.
      if (dbError.code === "23505") {
        return { success: false, error: "Ya existe una carta con ese identificador." };
      }
      return { success: false, error: "Error al guardar la carta." };
    }

    // 5. AUDITORÍA
    await logAdminAction(
      id ? "UPDATE_MENU" : "CREATE_MENU",
      "menus",
      user.id,
      { email: user.email, menu_nombre: saved?.nombre },
      saved?.id ?? null
    );

    // 6. REVALIDACIÓN
    revalidatePath("/admin/menus");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL MENU]:", error);
    return { success: false, error: "Error inesperado de servidor." };
  }
}

// ============================================================================
// DELETE CARTA (soft delete — marca is_deleted, no borra la fila)
// ============================================================================
export async function deleteMenu(menuId: string): Promise<ActionResponse> {
  try {
    // 1. SESIÓN + RATE LIMIT + ROL
    const guard = await guardAction({
      intent: "DELETE_MENU",
      table: "menus",
      targetId: menuId,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // 2. SOFT DELETE
    const { error } = await supabase
      .from("menus")
      .update({ is_deleted: true })
      .eq("id", menuId);

    if (error) {
      console.error("[DB ERROR DELETE MENU]:", error);
      return { success: false, error: "Error al eliminar la carta." };
    }

    // 3. AUDITORÍA
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
    // 1. SESIÓN + RATE LIMIT + ROL
    //    Antes esta action NO logueaba intentos no autorizados: era la única
    //    del archivo sin rastro en el trail. El guard lo corrige de fábrica.
    const guard = await guardAction({
      intent: "REORDER_MENUS",
      table: "menus",
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // 2. VALIDACIÓN — el array viene del cliente como JSON crudo.
    const validated = reorderSchema.safeParse(ordenados);
    if (!validated.success) {
      console.warn("[REORDER] payload inválido de", user.id);
      return { success: false, error: "Datos de orden inválidos." };
    }

    // 3. Actualización por lote. Cada update es chico; con pocas cartas es trivial.
    for (const item of validated.data) {
      const { error } = await supabase
        .from("menus")
        .update({ orden: item.orden })
        .eq("id", item.id);
      if (error) {
        console.error("[DB ERROR REORDER MENU]:", error);
        return { success: false, error: "Error al guardar el orden." };
      }
    }

    // 4. AUDITORÍA
    await logAdminAction(
      "REORDER_MENUS",
      "menus",
      user.id,
      { email: user.email, count: validated.data.length }
    );

    revalidatePath("/admin/menus");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL MENU]:", error);
    return { success: false, error: "Error inesperado al reordenar." };
  }
}