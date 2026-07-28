// src/app/admin/(dashboard)/errores/page.tsx
import { guardAction } from "@/lib/guard";
import { redirect } from "next/navigation";
import ErroresClient from "@/components/admin/ErroresClient";

export const dynamic = "force-dynamic";

export default async function ErroresPage() {
  // CM y SUPERADMIN pueden VER. El botón de resolver se condiciona por rol
  // adentro del cliente, y el action marcarErrorResuelto ya exige SUPERADMIN.
  const guard = await guardAction({
    intent: "VIEW_SYSTEM_ERRORS",
    table: "system_errors",
    roles: ["SUPERADMIN", "CM"],
    limit: "none",
  });

  if (!guard.ok) redirect("/admin");

  const { supabase, role } = guard;

  const { data: errores } = await supabase
    .from("system_errors")
    .select("id, error_message, stack_trace, dedup_key, resolved, resolved_at, created_at")
    .order("resolved", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  return <ErroresClient errores={errores ?? []} rol={role} />;
}