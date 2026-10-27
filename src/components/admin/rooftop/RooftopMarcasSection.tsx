import { createClient } from "@/lib/supabase/server";
import RooftopMarcasClient from "@/components/admin/RooftopMarcasClient";

export default async function RooftopMarcasSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooftop_marcas").select("*")
    .eq("is_deleted", false).order("orden", { ascending: true });
  const hasImg = (data?.length ?? 0) > 0;

  return (
    <section className={`rounded-sm border border-neutral-800 border-l-2 bg-neutral-950/40 p-5 sm:p-6 transition-colors focus-within:border-l-white/40 ${hasImg ? "border-l-white/40" : "border-l-neutral-800"}`}>
      <RooftopMarcasClient marcas={data ?? []} />
    </section>
  );
}