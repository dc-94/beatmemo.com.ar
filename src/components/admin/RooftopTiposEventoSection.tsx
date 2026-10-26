import { createClient } from "@/lib/supabase/server";
import RooftopTiposEventoClient from "@/components/admin/RooftopTiposEventoClient";

export default async function RooftopTiposEventoSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooftop_tipos_evento").select("*")
    .eq("is_deleted", false).order("orden", { ascending: true });

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 sm:p-6">
      <RooftopTiposEventoClient tipos={data ?? []} />
    </section>
  );
}