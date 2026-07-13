import { createClient } from "@/lib/supabase/server";

/**
 * Servicio centralizado de auditoría.
 *
 * @param action   - Tipo de acción (ej: 'LOGIN_SUCCESS', 'UPDATE_SHOW')
 * @param tableName- Tabla afectada (ej: 'eventos', 'auth.users')
 * @param adminId  - UUID del usuario que ejecuta la acción (auth.users.id).
 *                   Se guarda en la columna admin_id (FK real), NO enterrado
 *                   en metadata. Para acciones sin usuario resuelto, pasar null.
 * @param metadata - JSON con el detalle (email, old_data, new_data, etc.)
 * @param recordId - ID del registro afectado. Si no aplica (ej: login), queda null.
 *
 * NOTA: el insert es AWAIT, no fire-and-forget. En serverless (Vercel) la lambda
 * se congela al responder y una promesa .then() pendiente puede morir sin ejecutarse:
 * eso causaba pérdida silenciosa e intermitente de auditoría. Con await, el log
 * se confirma antes de que la función retorne.
 */
export async function logAdminAction(
  action: string,
  tableName: string,
  adminId: string | null,
  metadata: Record<string, any>,
  recordId: string | null = null
) {
  const supabase = await createClient();

  const finalMetadata = {
    ...metadata,
    email: metadata.email || "UNKNOWN",
    timestamp: new Date().toISOString(),
  };

  const { error } = await supabase.from("admin_logs").insert({
    action_type: action,
    table_name: tableName,
    admin_id: adminId,
    record_id: recordId,
    metadata: finalMetadata,
  });

  if (error) {
    // El log falló, pero NO tumbamos la acción del usuario por eso:
    // registramos el fallo en el log del servidor y seguimos.
    console.error("[AuditLog] Fallo al registrar acción:", error.message);
  }
}