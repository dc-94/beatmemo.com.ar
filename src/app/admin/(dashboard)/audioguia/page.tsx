import { createClient } from "@/lib/supabase/server";
import AudioguiaClient from "@/components/admin/AudioguiaClient";

export const dynamic = "force-dynamic";

export default async function AudioguiaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audioguia_tracks")
    .select("*")
    .eq("is_deleted", false)
    .order("orden", { ascending: true });

  return <AudioguiaClient tracks={data ?? []} />;
}