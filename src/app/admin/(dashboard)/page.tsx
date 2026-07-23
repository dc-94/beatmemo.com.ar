// src/app/admin/(dashboard)/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Coffee, Activity, ShieldAlert } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Consultas paralelas. FIX: apuntan a las tablas REALES (eventos, pub) y
  // excluyen los borrados lógicos para que el KPI refleje el catálogo activo.
  const [
    { count: totalEventos },
    { count: totalPub },
    { count: erroresAbiertos },
  ] = await Promise.all([
    supabase.from("eventos").select("*", { count: "exact", head: true }).eq("is_deleted", false),
    supabase.from("pub").select("*", { count: "exact", head: true }).eq("is_deleted", false),
    supabase.from("system_errors").select("*", { count: "exact", head: true }).eq("resolved", false),
  ]);

  const sinErrores = (erroresAbiertos ?? 0) === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-neutral-400">Bienvenido de vuelta, Administrador.</p>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Eventos" value={totalEventos ?? 0} icon={<Calendar className="text-blue-400" />} href="/admin/shows" />
        <StatCard title="Items Pub" value={totalPub ?? 0} icon={<Coffee className="text-amber-400" />} href="/admin/gastronomia" />
        <StatCard title="Auditoría" value="Ver Logs" icon={<ShieldAlert className="text-red-400" />} href="/admin/logs" />

        {/* Card de sistema: usa StatCard como las demás para que sean idénticas,
            con el color condicionado por si hay errores abiertos. */}
        <Link href="/admin/errores">
          <div className={`p-6 rounded-xl flex items-center gap-4 border transition-colors ${
            sinErrores
              ? "bg-white/5 border-white/10 hover:bg-white/10"
              : "bg-red-950/30 border-red-900/50 hover:bg-red-950/50"
          }`}>
            <div className="p-3 bg-white/5 rounded-lg">
              <Activity className={sinErrores ? "text-green-400" : "text-red-400"} />
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Sistema</p>
              <p className="text-2xl font-bold text-white">
                {sinErrores ? "Óptimo" : `${erroresAbiertos} error${erroresAbiertos === 1 ? "" : "es"}`}
              </p>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, href }: { title: string; value: string | number; icon: React.ReactNode; href?: string }) {
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