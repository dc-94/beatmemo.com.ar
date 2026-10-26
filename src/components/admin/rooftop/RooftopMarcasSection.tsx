import { createClient } from "@/lib/supabase/server";
import RooftopMarcasClient from "@/components/admin/RooftopMarcasClient";

export default async function RooftopMarcasSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooftop_marcas").select("*")
    .eq("is_deleted", false).order("orden", { ascending: true });

  return (    
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 sm:p-6">
      <RooftopMarcasClient marcas={data ?? []} />
    </section>
  );
}