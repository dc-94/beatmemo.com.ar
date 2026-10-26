import { createClient } from "@/lib/supabase/server";
import RooftopGaleriaClient from "@/components/admin/RooftopGaleriaClient";

export default async function RooftopGaleriaSection() {
  const supabase = await createClient();
  const [{ data: seccion }, { data: fotos }] = await Promise.all([
    supabase.from("rooftop_secciones").select("*").eq("clave", "descubri").maybeSingle(),
    supabase.from("rooftop_galeria").select("*").eq("is_deleted", false).order("orden", { ascending: true }),
  ]);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 sm:p-6">
      <RooftopGaleriaClient seccion={seccion ?? null} fotos={fotos ?? []} />
    </section>
  );
}