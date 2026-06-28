// src/app/admin/(dashboard)/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Calendar, Coffee, FileText, Megaphone, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // Consultas paralelas para máxima performance (aprovechando Server Components)
  const [
    { count: totalShows },
    { count: totalPubItems },
    { data: logs }
  ] = await Promise.all([
    supabase.from('shows').select('*', { count: 'exact', head: true }),
    supabase.from('pub_items').select('*', { count: 'exact', head: true }),
    supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Saludo y KPIs */}
      <header>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-neutral-400">Bienvenido de vuelta, Administrador.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Shows Activos" value={totalShows || 0} icon={<Calendar className="text-blue-400"/>} />
        <StatCard title="Items en Pub" value={totalPubItems || 0} icon={<Coffee className="text-amber-400"/>} />
        <StatCard title="Estado del Sistema" value="Óptimo" icon={<Activity className="text-green-400"/>} />
      </section>

      {/* Actividad Reciente (Caja Negra) */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Actividad Reciente</h2>
        <div className="space-y-4">
          {logs?.map((log) => (
            <div key={log.id} className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <p className="text-sm text-white font-medium capitalize">{log.action_type} en {log.table_name}</p>
                <p className="text-xs text-neutral-500">{new Date(log.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {logs?.length === 0 && <p className="text-sm text-neutral-500">No hay actividad reciente.</p>}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-neutral-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}