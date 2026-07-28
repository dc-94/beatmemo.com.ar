// src/components/admin/ErroresClient.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { marcarErrorResuelto } from "@/actions/system-errors";
import { explicarError, origenError } from "@/lib/error-helpers";

interface SystemError {
  id: string;
  error_message: string;
  stack_trace: string | null;
  dedup_key: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const SEV_COLOR = {
  alta: "text-red-400 bg-red-950/40 border-red-900/50",
  media: "text-amber-400 bg-amber-950/30 border-amber-900/40",
  baja: "text-neutral-400 bg-neutral-900 border-neutral-800",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
}

export default function ErroresClient({ errores, rol }: { errores: SystemError[]; rol: string }) {
  const esSuperadmin = rol === "SUPERADMIN";

  const [abierto, setAbierto] = useState<string | null>(null);
  const [resolviendo, setResolviendo] = useState<string | null>(null);

  const abiertos = errores.filter((e) => !e.resolved);
  const resueltos = errores.filter((e) => e.resolved);

  const handleResolver = async (id: string) => {
    setResolviendo(id);
    try {
      const res = await marcarErrorResuelto(id);
      if (res.success) toast.success("Marcado como resuelto");
      else toast.error(res.error || "No se pudo marcar");
    } catch (e) {
      console.error("[ErroresClient]", e);
      toast.error("No se pudo marcar. Revisá tu conexión.");
    } finally {
      setResolviendo(null);
    }
  };

  const renderError = (err: SystemError) => {
    const info = explicarError(err.error_message);
    const origen = origenError(err.error_message);
    const expandido = abierto === err.id;

    return (
      <div key={err.id} className={`border rounded-lg overflow-hidden ${err.resolved ? "border-neutral-800 opacity-60" : SEV_COLOR[info.severidad]}`}>
        <button onClick={() => setAbierto(expandido ? null : err.id)} className="w-full text-left p-4 flex items-start gap-3">
          {err.resolved
            ? <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
            : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{info.titulo}</span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 border border-neutral-700 px-1.5 py-0.5 rounded">
                {origen}
              </span>
            </div>
            <p className="text-neutral-400 text-sm mt-1">{info.causa}</p>
            <p className="text-neutral-600 text-xs mt-1.5">
              Apareció: {fmt(err.created_at)}
              {err.resolved_at && ` · Resuelto: ${fmt(err.resolved_at)}`}
            </p>
          </div>
          <ChevronDown size={16} className={`shrink-0 text-neutral-500 transition-transform ${expandido ? "rotate-180" : ""}`} />
        </button>

        {expandido && (
          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/5">
            <div className="pt-3">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Qué hacer</p>
              <p className="text-neutral-300 text-sm">{info.accion}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Mensaje técnico</p>
              <pre className="text-[11px] text-neutral-400 bg-black/40 p-2.5 rounded overflow-x-auto whitespace-pre-wrap font-mono">
                {err.error_message}
                {err.stack_trace && `\n\n${err.stack_trace}`}
              </pre>
            </div>
             {!err.resolved && esSuperadmin && (
              <button
                onClick={(e) => { e.stopPropagation(); handleResolver(err.id); }}
                disabled={resolviendo === err.id}
                className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded transition disabled:opacity-50"
              >
                {resolviendo === err.id ? "Marcando…" : "Marcar como resuelto"}
              </button>
            )}
            {!err.resolved && !esSuperadmin && (
              <p className="text-neutral-500 text-xs italic">
                Avisá a un administrador para resolverlo.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-white">Errores del Sistema</h1>
        <p className="text-neutral-400 text-sm">
          {abiertos.length === 0 ? "Sin errores pendientes" : `${abiertos.length} sin resolver`}
        </p>
      </div>

      {abiertos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 font-bold">Pendientes</h2>
          {abiertos.map(renderError)}
        </section>
      )}

      {resueltos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-neutral-500 font-bold">Resueltos</h2>
          {resueltos.map(renderError)}
        </section>
      )}

      {errores.length === 0 && (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          No hay errores registrados. Todo funcionando.
        </div>
      )}
    </div>
  );
}