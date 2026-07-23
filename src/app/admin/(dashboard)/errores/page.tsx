// src/app/admin/(dashboard)/errores/page.tsx
import { createClient } from "@/lib/supabase/server";
import ErroresClient from "@/components/admin/ErroresClient";

export const dynamic = "force-dynamic";

export default async function ErroresPage() {
  const supabase = await createClient();

  const { data: errores } = await supabase
    .from("system_errors")
    .select("id, error_message, stack_trace, dedup_key, resolved, resolved_at, created_at")
    .order("resolved", { ascending: true })       // abiertos primero
    .order("created_at", { ascending: false })
    .limit(100);

  return <ErroresClient errores={errores ?? []} />;
}