// src/app/admin/(dashboard)/pub/gastronomia/page.tsx
import { createClient } from "@/lib/supabase/server";
import GastronomiaFacetasClient from "@/components/admin/GastronomiaFacetasClient";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function GastronomiaPage() {
  const supabase = await createClient();

  // Solo los ítems con faceta asignada (los que se muestran en /pub).
  const [{ data: items }, { data: chips }, hh] = await Promise.all([
    supabase.from("pub").select("*").eq("is_deleted", false)
      .not("faceta", "is", null)
      .order("faceta", { ascending: true }).order("orden", { ascending: true }),
    supabase.from("pub_chips").select("nombre").order("nombre"),
    getSiteContent("pub_hh"),
  ]);

  return <GastronomiaFacetasClient items={items ?? []}
      categorias={(chips ?? []).map((c) => c.nombre)}
      hh={hh}
 />;
}