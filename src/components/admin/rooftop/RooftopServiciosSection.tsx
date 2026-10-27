import { createClient } from "@/lib/supabase/server";
import RooftopServiciosClient from "@/components/admin/RooftopServiciosClient";

export default async function RooftopServiciosSection() {
  const supabase = await createClient();
  const [{ data: seccion }, { data: servicios }] = await Promise.all([
    supabase.from("rooftop_secciones").select("*").eq("clave", "servicios").maybeSingle(),
    supabase.from("rooftop_servicios").select("*").eq("is_deleted", false).order("orden", { ascending: true }),
  ]);
  const hasImg = !!seccion?.imagen_url;

  return (
    <section className={`rounded-sm border border-neutral-800 border-l-2 bg-neutral-950/40 p-5 sm:p-6 transition-colors focus-within:border-l-white/40 ${hasImg ? "border-l-white/40" : "border-l-neutral-800"}`}>
      <RooftopServiciosClient seccion={seccion ?? null} servicios={servicios ?? []} />
    </section>
  );
}