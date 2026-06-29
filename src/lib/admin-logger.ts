import { createClient } from "@/lib/supabase/server";

export async function logAdminAction(action: string, metadata: any, isError: boolean = false) {
  const supabase = await createClient();
  
  await supabase.from('admin_logs').insert({
    action_type: action,
    table_name: isError ? 'auth_errors' : 'auth_success',
    metadata: { ...metadata, timestamp: new Date().toISOString() }
  });
}