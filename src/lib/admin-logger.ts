import { createClient } from "@/lib/supabase/server";

/**
 * Servicio centralizado de auditoría.
 * @param action - El tipo de acción (ej: 'LOGIN_SUCCESS', 'UPDATE_SHOW')
 * @param tableName - La tabla afectada (ej: 'shows', 'auth.users')
 * @param metadata - JSON con el detalle (old_data, new_data, mensaje, etc.)
 * @param recordId - El ID del registro específico (opcional)
 */

export async function logAdminAction(
  action: string, 
  tableName: string, 
  metadata: Record<string, any>,
  recordId: string = '00000000-0000-0000-0000-000000000000'
) {
  const supabase = await createClient();
  
  // Si no viene email en la metadata, forzamos UNKNOWN
  const finalMetadata = {
    ...metadata,
    email: metadata.email || 'UNKNOWN',
    timestamp: new Date().toISOString()
  };

  supabase.from('admin_logs').insert({
    action_type: action,
    table_name: tableName,
    record_id: recordId,
    metadata: finalMetadata
  }).then(({ error }) => {
    if (error) console.error("Fallo silencioso en log:", error);
  });
}