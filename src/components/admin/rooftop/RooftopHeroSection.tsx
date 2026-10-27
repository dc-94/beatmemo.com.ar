import { createClient } from "@/lib/supabase/server";
import RooftopHeroClient from "@/components/admin/RooftopHeroClient";


export default async function RooftopHeroSection() {
  const supabase = await createClient();
  const { data } = await supabase.from("rooftop_secciones").select("*").eq("clave", "hero").maybeSingle();
  const hasImg = ((data?.imagenes as string[] | undefined)?.length ?? 0) > 0;

  return (
    <section className={`rounded-sm border border-neutral-800 border-l-2 bg-neutral-950/40 p-5 sm:p-6 transition-colors focus-within:border-l-white/40 ${hasImg ? "border-l-white/40" : "border-l-neutral-800"}`}>
      <RooftopHeroClient seccion={data ?? null} />
    </section>
  );
}