// src/app/admin/(dashboard)/pub/espacio/page.tsx
import { createClient } from "@/lib/supabase/server";
import EspacioClient from "@/components/admin/EspacioClient";

export const dynamic = "force-dynamic";

export default async function EspacioPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("espacio_galeria")
    .select("id, imagen_url, titulo, epigrafe, orden, visible")
    .eq("is_deleted", false)
    .order("orden", { ascending: true });

  return <EspacioClient fotos={data ?? []} />;
}