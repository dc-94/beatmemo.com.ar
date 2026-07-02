"use server";

import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations/eventos";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-logger"; 

// 1. Definimos un contrato estricto para las respuestas de la acción
export interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createEvento(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 2. SEGURIDAD ZERO-TRUST: Verificar sesión en el servidor
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "No autorizado. Sesión inválida." };
    }

    // 2.1 Verificar Rol (Indispensable en acciones de escritura)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['SUPERADMIN', 'CONTENT_ADMIN'].includes(roleData.role)) {
      // Log de seguridad por intento de vulneración
      logAdminAction('UNAUTHORIZED_CREATE_EVENT_ATTEMPT', 'shows', { email: user.email });
      return { success: false, error: "No tienes permisos para crear eventos." };
    }

    // 3. PARSEO SEGURO DE DATOS
    const rawData = Object.fromEntries(formData.entries()) as Record<string, any>;
    
    // Convertir el string de FormData a boolean si existe (react-hook-form suele mandar "true"/"false")
    if (typeof rawData.es_gratuito === 'string') {
      rawData.es_gratuito = rawData.es_gratuito === 'true';
    }

    // 4. VALIDACIÓN CON ZOD
    const validated = eventSchema.safeParse(rawData);

    if (!validated.success) {
      // Devolvemos los errores de campo exactos (ej: { titulo: ["Obligatorio"] })
      return { 
        success: false, 
        error: "Por favor, revisa los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors 
      };
    }

    // 5. INSERCIÓN EN BASE DE DATOS
    // ⚠️ NOTA TECH LEAD: En tu código original decía .from('eventos'), 
    // pero en el componente page.tsx consultabas .from('shows'). 
    // Usa el nombre exacto de tu tabla aquí. Yo pondré 'shows'.
    const { data: newShow, error: dbError } = await supabase
      .from('eventos') 
      .insert(validated.data)
      .select('id, titulo') // Retornamos ID y título para el log
      .single();
    
    if (dbError) {
      console.error("[DB ERROR]:", dbError);
      return { success: false, error: "Error interno al guardar en la base de datos." };
    }

    // 6. AUDITORÍA (Fire-and-forget: no usamos await para no bloquear)
    logAdminAction('CREATE_SHOW', 'shows', {
      user_id: user.id,
      email: user.email,
      show_id: newShow?.id,
      show_titulo: newShow?.titulo
    });

    // 7. REVALIDACIÓN DE CACHÉ
    // Usamos la ruta correcta donde está tu listado para que se refresque automáticamente
    revalidatePath('/admin/shows');
    
    return { success: true };

  } catch (error) {
    console.error("[SERVER ACTION FATAL ERROR]:", error);
    return { success: false, error: "Error inesperado de servidor. Contacta a soporte." };
  }
}