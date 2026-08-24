// src/app/admin/(dashboard)/logs/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogsFilters from "@/components/admin/LogsFilters";
import { Fragment } from "react";
// Agregá arriba del componente en logs/page.tsx
const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Inició sesión",
  CREATE_SHOW: "Creó un evento",
  UPDATE_SHOW: "Editó un evento",
  SOFT_DELETE_SHOW: "Eliminó un evento",
  HARD_DELETE_SHOW: "Borró un evento (definitivo)",
  CREATE_PUB_ITEM: "Creó un plato/trago",
  UPDATE_PUB_ITEM: "Editó un plato/trago",
  SOFT_DELETE_PUB_ITEM: "Eliminó un plato/trago",
  CREATE_MENU: "Creó una carta",
  UPDATE_MENU: "Editó una carta",
  SOFT_DELETE_MENU: "Eliminó una carta",
  REORDER_MENUS: "Reordenó las cartas",
  UPLOAD_MENU_PDF: "Subió el PDF de una carta",
  CREATE_PROMO: "Creó una promoción",
  UPDATE_PROMO: "Editó una promoción",
  SOFT_DELETE_PROMO: "Eliminó una promoción",
  UPDATE_SITE_CONTENT: "Editó contenido de página",
  CREATE_ESPACIO: "Creó un espacio del pub",
  UPDATE_ESPACIO: "Editó un espacio del pub",
  SOFT_DELETE_ESPACIO: "Eliminó un espacio del pub",
  UPDATE_CONFIG: "Editó la configuración del sitio",
  CREATE_CICLO: "Creó un ciclo",
  UPDATE_CICLO: "Editó un ciclo",
  DELETE_CICLO: "Eliminó un ciclo",
};

// Los intentos no autorizados llegan como UNAUTHORIZED_<X>_ATTEMPT.
function labelAccion(actionType: string): { texto: string; alerta: boolean } {
  if (actionType.startsWith("UNAUTHORIZED_")) {
    return { texto: "⚠ Intento sin permisos", alerta: true };
  }
  return { texto: ACTION_LABELS[actionType] ?? actionType, alerta: false };
}

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

// Valida y sanea searchParams. Nunca confía en el input crudo de la URL
// (directiva anti parameter-tampering).
function parseParams(sp: Record<string, string | string[] | undefined>) {
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const page = Math.max(1, parseInt(get("page") || "1", 10) || 1);
  return {
    page,
    action: get("action"),
    email: get("email").trim(),
    desde: get("desde"),
    hasta: get("hasta"),
  };
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, action, email, desde, hasta } = parseParams(sp);

  const supabase = await createClient();

  // Construcción de la query con filtros como cláusulas en Postgres
  // (NO se filtra en el cliente: directiva anti-data-pollution).
  let query = supabase
    .from("admin_logs")
    .select("id, action_type, table_name, record_id, metadata, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (action) query = query.eq("action_type", action);
  if (email) query = query.ilike("metadata->>email", `%${email}%`);
  if (desde) query = query.gte("created_at", `${desde}T00:00:00`);
  if (hasta) query = query.lte("created_at", `${hasta}T23:59:59`);

  // Paginación con range() (server-side, no trae la tabla entera).
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: logs, count, error } = await query.range(from, to);

  if (error) console.error("[LogsPage]", error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Preserva los filtros al cambiar de página.
  const pageUrl = (p: number) => {
    const next = new URLSearchParams();
    if (action) next.set("action", action);
    if (email) next.set("email", email);
    if (desde) next.set("desde", desde);
    if (hasta) next.set("hasta", hasta);
    next.set("page", String(p));
    return `?${next.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-white">Auditoría del Sistema</h1>
        <span className="text-neutral-500 text-sm">{total} registros</span>
      </div>

      <LogsFilters
        currentAction={action}
        currentEmail={email}
        currentDesde={desde}
        currentHasta={hasta}
      />

      <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-800 text-neutral-400">
            <tr>
              <th className="p-4">Evento</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Entidad</th>
              <th className="p-4">Detalles</th>
              <th className="p-4 whitespace-nowrap">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No hay registros con estos filtros.
                </td>
              </tr>
            ) : (
              logs!.map((log, i) => {
                const fecha = new Date(log.created_at).toLocaleDateString("es-AR", {
                  timeZone: "America/Argentina/Buenos_Aires",
                  weekday: "long", day: "numeric", month: "long",
                });
                const fechaAnterior = i > 0
                  ? new Date(logs![i - 1].created_at).toLocaleDateString("es-AR", {
                      timeZone: "America/Argentina/Buenos_Aires",
                      weekday: "long", day: "numeric", month: "long",
                    })
                  : null;
                const nuevoDia = fecha !== fechaAnterior;

                return (
                  <Fragment key={log.id}>
                    {nuevoDia && (
                      <tr className="bg-neutral-950/60">
                        <td colSpan={5} className="px-4 py-2 text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
                          {fecha}
                        </td>
                      </tr>
                    )}
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 align-top">
                  <td className="p-4 whitespace-nowrap">
                    {(() => {
                      const { texto, alerta } = labelAccion(log.action_type);
                      return (
                        <span className={`font-medium ${alerta ? "text-amber-400" : "text-brand-red-100"}`}>
                          {texto}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4 text-neutral-300">{log.metadata?.email || "—"}</td>
                  {/* Columnas que la UI vieja ignoraba: table_name + record_id */}
                  <td className="p-4 text-neutral-400">
                    {log.table_name}
                    {log.record_id && (
                      <span className="block text-[10px] text-neutral-600 font-mono truncate max-w-[140px]">
                        {log.record_id}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-neutral-300 max-w-xs">
                    {log.action_type === "LOGIN_SUCCESS"
                      ? "Acceso exitoso"
                      : log.metadata?.item_nombre ||
                        log.metadata?.show_titulo ||
                        log.metadata?.promo_titulo ||
                        log.metadata?.menu_nombre ||
                        log.metadata?.message ||
                        "Acción registrada"}
                  </td>
                  <td className="p-4 text-neutral-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("es-AR", {
                      timeZone: "America/Argentina/Buenos_Aires",
                    })}
                  </td>
                </tr>
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 text-sm">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageUrl(page - 1)} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-sm transition">
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link href={pageUrl(page + 1)} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-sm transition">
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}