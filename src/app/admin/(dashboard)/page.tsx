// src/app/admin/(dashboard)/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Calendar, Coffee, FileText, Megaphone, Activity,ShieldAlert } from "lucide-react";

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
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Shows" value={totalShows || 0} icon={<Calendar className="text-blue-400"/>} href="/admin/shows" />
        <StatCard title="Items Pub" value={totalPubItems || 0} icon={<Coffee className="text-amber-400"/>} href="/admin/gastronomia" />
        <StatCard title="Auditoría" value="Ver Logs" icon={<ShieldAlert className="text-red-400"/>} href="/admin/logs" />
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
            <Activity className="text-green-400" />
            <div>
                <p className="text-xs text-neutral-400 uppercase">Sistema</p>
                <p className="text-lg font-bold text-white">Óptimo</p>
            </div>
        </div>
      </section>
    </div>
  );
}
// Actualizamos StatCard para que sea clickable si tiene href
function StatCard({ title, value, icon, href }: { title: string, value: string | number, icon: React.ReactNode, href?: string }) {
  const content = (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
      <div className="p-3 bg-white/5 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-neutral-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}