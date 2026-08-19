// src/app/admin/(dashboard)/pub/gastronomia/page.tsx
import { createClient } from "@/lib/supabase/server";
import GastronomiaFacetasClient from "@/components/admin/GastronomiaFacetasClient";

export const dynamic = "force-dynamic";

export default async function GastronomiaPage() {
  const supabase = await createClient();

  // Solo los ítems con faceta asignada (los que se muestran en /pub).
  const { data: items } = await supabase
    .from("pub")
    .select("*")
    .eq("is_deleted", false)
    .not("faceta", "is", null)
    .order("faceta", { ascending: true })
    .order("orden", { ascending: true });

  const { data: chips } = await supabase.from("pub_chips").select("nombre").order("nombre");

  return <GastronomiaFacetasClient items={items ?? []} categorias={(chips ?? []).map(c => c.nombre)} />;
}