import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsuariosClient from "@/components/admin/UsuariosClient";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: yo } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
  if (yo?.role !== "SUPERADMIN") redirect("/admin"); 


  const { data: admins } = await supabase.rpc("listar_admins");
  // Invitados pendientes (aún no se loguearon)
  const { data: invitados } = await supabase
    .from("admin_invitados")
    .select("email, rol, estado, created_at")
    .order("created_at", { ascending: false });
    
  return <UsuariosClient admins={admins ?? []} invitados={invitados ?? []} miUserId={user.id} />;
}