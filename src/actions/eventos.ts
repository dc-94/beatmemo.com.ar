"use server";

import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations/eventos";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-logger";

// 1. Contrato estricto de respuestas
export interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ============================================================================
// UPSERT (CREAR O EDITAR EVENTO UNIFICADO)
// ============================================================================
export async function upsertEvento(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. SEGURIDAD: Verificar sesión activa
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "No autorizado. Sesión inválida." };
    }

    // 2. SEGURIDAD: Verificar Rol (Solo SUPERADMIN y CONTENT_ADMIN)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['SUPERADMIN', 'CONTENT_ADMIN'].includes(roleData.role)) {
      await logAdminAction(
        id ? 'UNAUTHORIZED_UPDATE_EVENT_ATTEMPT' : 'UNAUTHORIZED_CREATE_EVENT_ATTEMPT',
        'eventos',
        user.id,
        { email: user.email, target_id: id },
        id ?? null
      );
      return { success: false, error: "No tienes permisos para modificar eventos." };
    }

    // 3. PARSEO SEGURO
    const rawData = Object.fromEntries(formData.entries()) as Record<string, any>;

    if (typeof rawData.es_gratuito === 'string') {
      rawData.es_gratuito = rawData.es_gratuito === 'true';
    }

    // 4. VALIDACIÓN ZOD
    const validated = eventSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: "Por favor, revisa los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors
      };
    }

    let dbError;
    let savedShow;

    // 5. INSERCIÓN O ACTUALIZACIÓN CONDICIONAL
    if (id) {
      // MODO EDICIÓN
      const { data, error } = await supabase
        .from('eventos')
        .update(validated.data)
        .eq('id', id)
        .select('id, titulo')
        .single();
      dbError = error;
      savedShow = data;
    } else {
      // MODO CREACIÓN
      const { data, error } = await supabase
        .from('eventos')
        .insert(validated.data)
        .select('id, titulo')
        .single();
      dbError = error;
      savedShow = data;
    }

    if (dbError) {
      console.error("[DB ERROR UPSERT]:", dbError);
      return { success: false, error: "Error interno al guardar en la base de datos." };
    }

    // 6. AUDITORÍA INTELIGENTE (Detecta si fue creación o edición)
    await logAdminAction(
      id ? 'UPDATE_SHOW' : 'CREATE_SHOW',
      'eventos',
      user.id,
      { email: user.email, show_titulo: savedShow?.titulo },
      savedShow?.id ?? null
    );

    // 7. REVALIDACIÓN DE CACHÉ
    revalidatePath('/admin/shows');
    revalidatePath('/');
    revalidatePath('/agenda');
    return { success: true };

  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR]:", error);
    return { success: false, error: "Error inesperado de servidor. Contacta a soporte." };
  }
}

// ============================================================================
// BORRADO (SOFT/HARD DELETE SEGÚN ROL)
// ============================================================================
export async function deleteEvento(showId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. SEGURIDAD: Verificar sesión activa
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "No autorizado. Sesión inválida." };
    }

    // 2. SEGURIDAD: Obtener rol del usuario
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['SUPERADMIN', 'CONTENT_ADMIN'].includes(roleData.role)) {
      await logAdminAction(
        'UNAUTHORIZED_DELETE_EVENT_ATTEMPT',
        'eventos',
        user.id,
        { email: user.email },
        showId
      );
      return { success: false, error: "No tienes permisos para eliminar eventos." };
    }

    // 3. EJECUCIÓN (Delega a la base de datos la decisión de Soft/Hard Delete)
    const { error } = await supabase.rpc('handle_delete_show', {
      show_id: showId,
      user_role: roleData.role
    });

    if (error) {
      console.error("[DB ERROR DELETE]:", error);
      return { success: false, error: "Error en la base de datos al eliminar el evento." };
    }

    // 4. AUDITORÍA (Dejamos registro de si fue borrado físico o lógico)
    await logAdminAction(
      roleData.role === 'SUPERADMIN' ? 'HARD_DELETE_SHOW' : 'SOFT_DELETE_SHOW',
      'eventos',
      user.id,
      { email: user.email },
      showId
    );

    revalidatePath('/admin/shows');
    return { success: true };

  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR]:", error);
    return { success: false, error: "Error inesperado de servidor al eliminar." };
  }
}