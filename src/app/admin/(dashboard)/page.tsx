// src/app/admin/(dashboard)/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Coffee, Activity, ShieldAlert } from "lucide-react";
import { explicarError, origenError } from "@/lib/error-helpers";
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
// Además del count, traé los últimos sin resolver para la lista compacta.
  const { data: erroresPendientes } = await supabase
    .from("system_errors")
    .select("id, error_message, created_at")
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .limit(4);

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
      {/* Lista compacta de errores pendientes. Solo aparece si hay.
          El detalle completo y el botón de resolver viven en /admin/errores. */}
      {erroresPendientes && erroresPendientes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest text-red-400 font-bold">
              Errores sin resolver
            </h2>
            <Link href="/admin/errores" className="text-neutral-400 text-xs hover:text-white transition">
              Ver todos →
            </Link>
          </div>

          <div className="space-y-2">
            {erroresPendientes.map((err) => {
              const info = explicarError(err.error_message);
              const origen = origenError(err.error_message);
              return (
                <Link
                  key={err.id}
                  href="/admin/errores"
                  className="block bg-red-950/20 border border-red-900/40 rounded-lg px-4 py-3 hover:bg-red-950/40 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white text-sm font-medium truncate">{info.titulo}</span>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 border border-neutral-700 px-1.5 py-0.5 rounded shrink-0">
                      {origen}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {new Date(err.created_at).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
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