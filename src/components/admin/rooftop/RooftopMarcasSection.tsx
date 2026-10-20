import { createClient } from "@/lib/supabase/server";
import RooftopMarcasClient from "@/components/admin/RooftopMarcasClient";

export default async function RooftopMarcasSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooftop_marcas").select("*")
    .eq("is_deleted", false).order("orden", { ascending: true });

  return (
    <section className="border-t border-neutral-800 pt-8">
      <RooftopMarcasClient marcas={data ?? []} />
    </section>
  );
}