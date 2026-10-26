import { createClient } from "@/lib/supabase/server";
import RooftopHeroClient from "@/components/admin/RooftopHeroClient";

export default async function RooftopHeroSection() {
  const supabase = await createClient();
  const { data } = await supabase.from("rooftop_secciones").select("*").eq("clave", "hero").maybeSingle();

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 sm:p-6">
      <RooftopHeroClient seccion={data ?? null} />
    </section>
  );
}