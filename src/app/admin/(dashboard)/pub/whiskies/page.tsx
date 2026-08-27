// src/app/admin/(dashboard)/whiskies/page.tsx
import { createClient } from "@/lib/supabase/server";
import WhiskiesClient from "@/components/admin/WhiskiesClient";

export const dynamic = "force-dynamic";

export default async function WhiskiesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("whiskies")
    .select("id, marca, expresion, coleccion, logo_url, tiene_hh, orden, disponible")
    .eq("is_deleted", false)
    .order("coleccion", { ascending: true })
    .order("orden", { ascending: true });

  return <WhiskiesClient whiskies={data ?? []} />;
}