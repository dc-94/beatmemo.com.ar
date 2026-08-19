// src/app/admin/(dashboard)/pub/destacados/page.tsx
import { createClient } from "@/lib/supabase/server";
import DestacadosClient from "@/components/admin/DestacadosClient";

export const dynamic = "force-dynamic";

export default async function DestacadosPage() {
  const supabase = await createClient();

  // Solo los ítems marcados para el home. Misma tabla pub, vista filtrada.
  const { data: items } = await supabase
    .from("pub")
    .select("*")
    .eq("is_deleted", false)
    .eq("destacado_home", true)
    .order("orden", { ascending: true });

    return <DestacadosClient items={items ?? []} categorias={[]} />;
}