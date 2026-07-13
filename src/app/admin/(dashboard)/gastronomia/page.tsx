// src/app/admin/(dashboard)/gastronomia/page.tsx
import { createClient } from "@/lib/supabase/server";
import GastronomiaClient from "@/components/admin/GastronomiaClient";

export const dynamic = "force-dynamic";

export default async function GastronomiaPage() {
  const supabase = await createClient();

  // Traemos items activos (no borrados) y las categorías para el selector.
  const [{ data: items }, { data: chips }] = await Promise.all([
    supabase
      .from("pub")
      .select("*")
      .eq("is_deleted", false)
      .order("categoria", { ascending: true })
      .order("orden", { ascending: true }),
    supabase.from("pub_chips").select("nombre").order("nombre", { ascending: true }),
  ]);

  return (
    <GastronomiaClient
      items={items ?? []}
      categorias={(chips ?? []).map((c) => c.nombre)}
    />
  );
}