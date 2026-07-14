// src/app/admin/(dashboard)/menus/page.tsx
import { createClient } from "@/lib/supabase/server";
import MenusClient from "@/components/admin/MenusClient";

export const dynamic = "force-dynamic";

export default async function MenusPage() {
  const supabase = await createClient();

  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .eq("is_deleted", false)
    .order("orden", { ascending: true });

  return <MenusClient menus={menus ?? []} />;
}