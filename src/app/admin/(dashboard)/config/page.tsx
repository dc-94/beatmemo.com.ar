// src/app/admin/(dashboard)/config/page.tsx
import { createClient } from "@/lib/supabase/server";
import ConfigClient from "@/components/admin/ConfigClient";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("config_sitio").select("*").eq("id", 1).maybeSingle();
  return <ConfigClient config={data} />;
}