// src/app/admin/(dashboard)/logs/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function LogsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: logs } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-white">Auditoría del Sistema</h1>
      <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-800 text-neutral-400">
            <tr>
              <th className="p-4">Evento</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Detalles</th>
              <th className="p-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium text-brand-red-100">{log.action_type}</td>
                <td className="p-4">{log.metadata?.email || "UNKNOWN"}</td>
                <td className="p-4 text-neutral-300">
                  {log.action_type === 'LOGIN_SUCCESS' ? "Acceso exitoso" : log.metadata?.message || "Acción registrada"}
                </td>
                <td className="p-4 text-neutral-500">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}