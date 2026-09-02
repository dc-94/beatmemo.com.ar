// src/components/eventos/ArchivoEventos.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { getTema, type Superficie } from "@/lib/evento-tema";
import type { PublicEvent } from "@/lib/shows-data";

interface EventoConTema extends PublicEvent {
  estilo_tema?: string | null;
}

interface Props {
  eventos: EventoConTema[];
  superficie?: Superficie;
  onEventoClick: (evento: EventoConTema) => void;
}

// Agrupa por "YYYY-MM" y arma el label legible del mes.
function agruparPorMes(eventos: EventoConTema[]) {
  const ahora = new Date();
  const claveActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;

  const grupos: Record<string, { label: string; eventos: EventoConTema[] }> = {};
  for (const ev of eventos) {
    const [y, m] = ev.fecha.split("-");
    const clave = `${y}-${m}`;
    if (!grupos[clave]) {
      const fecha = new Date(Number(y), Number(m) - 1, 1);
      // Si es el mes en curso, "Este mes"; si no, el nombre del mes.
      const label = clave === claveActual
        ? "Este mes"
        : fecha.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
      grupos[clave] = { label, eventos: [] };
    }
    grupos[clave].eventos.push(ev);
  }
  return Object.entries(grupos).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function ArchivoEventos({ eventos, superficie = "dark", onEventoClick }: Props) {
  const grupos = agruparPorMes(eventos);
  // El mes más reciente (primero del array ordenado) arranca abierto.
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set(grupos.length ? [grupos[0][0]] : []));

  const toggle = (clave: string) => {
    setAbiertos((prev) => {
      const next = new Set(prev);
      next.has(clave) ? next.delete(clave) : next.add(clave);
      return next;
    });
  };

  const dark = superficie === "dark";

  if (eventos.length === 0) return null;

  return (
    <div className="space-y-3">
      {grupos.map(([clave, { label, eventos: evs }]) => {
        const abierto = abiertos.has(clave);
        return (
          <div key={clave} className={`border ${dark ? "border-white/10" : "border-black/10"}`}>
            {/* Cabecera del mes: click para abrir/cerrar */}
            <button
              onClick={() => toggle(clave)}
              className={`w-full flex items-center justify-between px-4 py-3 ${dark ? "hover:bg-white/5" : "hover:bg-black/5"} transition-colors`}
            >
              <span className="flex items-baseline gap-3">
                <span className={`font-serif text-lg font-bold capitalize ${dark ? "text-white" : "text-neutral-900"}`}>{label}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {evs.length} evento{evs.length !== 1 ? "s" : ""}
                </span>
              </span>
              <ChevronDown size={18} className={`text-neutral-500 transition-transform ${abierto ? "rotate-180" : ""}`} />
            </button>

            {/* Filas del mes, 2 columnas en md */}
            {abierto && (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-px ${dark ? "bg-white/5" : "bg-black/5"}`}>
                {evs.map((ev) => {
                  const tema = getTema(ev.estilo_tema, superficie);
                  const fecha = new Date(`${ev.fecha}T${ev.hora}`);
                  const dia = fecha.toLocaleDateString("es-AR", { day: "numeric" });
                  const diaSem = fecha.toLocaleDateString("es-AR", { weekday: "short" });
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onEventoClick(ev)}
                      className={`flex items-center gap-3 p-3 text-left ${dark ? "bg-[#141414] hover:bg-[#1c1c1c]" : "bg-white hover:bg-neutral-50"} transition-colors`}
                    >
                      <div className="text-center shrink-0 w-11" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                        <span className={`block text-xl font-bold ${dark ? "text-neutral-300" : "text-neutral-700"}`}>{dia}</span>
                        <span className="text-[10px] uppercase text-neutral-500">{diaSem}</span>
                      </div>
                      <div className="relative w-16 h-11 shrink-0 bg-neutral-800 rounded-sm overflow-hidden">
                        {ev.url_imagen && (
                          <Image src={getOptimizedImageUrl(ev.url_imagen, 128, 88)} alt="" fill className="object-cover" sizes="64px" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[10px] uppercase tracking-[0.16em] font-semibold truncate ${tema.ciclo}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                          {ev.ciclos?.nombre ?? ""}
                        </p>
                        <p className={`font-serif text-sm font-bold truncate ${dark ? "text-white" : "text-neutral-900"}`}>{ev.titulo}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}