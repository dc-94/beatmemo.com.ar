import { createClient } from "@/lib/supabase/server";
import RooftopGaleriaClient from "@/components/admin/RooftopGaleriaClient";

export default async function RooftopGaleriaSection() {
  const supabase = await createClient();
  const [{ data: seccion }, { data: fotos }] = await Promise.all([
    supabase.from("rooftop_secciones").select("*").eq("clave", "descubri").maybeSingle(),
    supabase.from("rooftop_galeria").select("*").eq("is_deleted", false).order("orden", { ascending: true }),
  ]);
  const hasImg = (fotos?.length ?? 0) > 0;

  return (
    <section className={`rounded-sm border border-neutral-800 border-l-2 bg-neutral-950/40 p-5 sm:p-6 transition-colors focus-within:border-l-white/40 ${hasImg ? "border-l-white/40" : "border-l-neutral-800"}`}>
      <RooftopGaleriaClient seccion={seccion ?? null} fotos={fotos ?? []} />
    </section>
  );
}