// src/actions/eventos.ts
"use server";

import { revalidatePath } from "next/cache";
import { eventSchema } from "@/lib/validations/eventos";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

// NOTA: el contrato ActionResponse vive en lib/guard.ts. Acá solo se
// exportan funciones async ("use server").

// ============================================================================
// UPSERT (CREAR O EDITAR EVENTO UNIFICADO)
// ============================================================================
export async function upsertEvento(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    // 1. SESIÓN + RATE LIMIT + ROL
    const guard = await guardAction({
      intent: id ? "UPDATE_EVENT" : "CREATE_EVENT",
      table: "eventos",
      targetId: id ?? null,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // 2. PARSEO SEGURO
    const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    if (typeof rawData.es_gratuito === "string") {
      rawData.es_gratuito = rawData.es_gratuito === "true";
    }

    // 3. VALIDACIÓN ZOD
    const validated = eventSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "Por favor, revisa los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // 4. INSERT O UPDATE — el ternario devuelve el builder SIN ejecutar
    //    (Regla Crítica del thenable); se ejecuta recién en el await.
    const query = id
      ? supabase.from("eventos").update(validated.data).eq("id", id).select("id, titulo").single()
      : supabase.from("eventos").insert(validated.data).select("id, titulo").single();

    const { data: savedShow, error: dbError } = await query;

    if (dbError) {
      console.error("[DB ERROR UPSERT]:", dbError);
      return { success: false, error: "Error interno al guardar en la base de datos." };
    }

    // 5. AUDITORÍA
    await logAdminAction(
      id ? "UPDATE_SHOW" : "CREATE_SHOW",
      "eventos",
      user.id,
      { email: user.email, show_titulo: savedShow?.titulo },
      savedShow?.id ?? null
    );

    // 6. REVALIDACIÓN
    revalidatePath("/admin/shows");
    revalidatePath("/");
    revalidatePath("/agenda");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR]:", error);
    return { success: false, error: "Error inesperado de servidor. Contacta a soporte." };
  }
}

// ============================================================================
// BORRADO (SOFT/HARD DELETE SEGÚN ROL — decide la función de DB)
// ============================================================================
export async function deleteEvento(showId: string): Promise<ActionResponse> {
  try {
    // 1. SESIÓN + RATE LIMIT + ROL
    const guard = await guardAction({
      intent: "DELETE_EVENT",
      table: "eventos",
      targetId: showId,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user, role } = guard;

    // 2. EJECUCIÓN — la DB decide soft/hard según el rol.
    //    El guard nos devuelve el rol verificado contra user_roles: es el
    //    mismo dato que antes salía de la query inline.
    const { error } = await supabase.rpc("handle_delete_show", {
      show_id: showId,
      user_role: role,
    });

    if (error) {
      console.error("[DB ERROR DELETE]:", error);
      return { success: false, error: "Error en la base de datos al eliminar el evento." };
    }

    // 3. AUDITORÍA (registra si fue borrado físico o lógico)
    await logAdminAction(
      role === "SUPERADMIN" ? "HARD_DELETE_SHOW" : "SOFT_DELETE_SHOW",
      "eventos",
      user.id,
      { email: user.email },
      showId
    );

    revalidatePath("/admin/shows");
    return { success: true };
  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR]:", error);
    return { success: false, error: "Error inesperado de servidor al eliminar." };
  }
}