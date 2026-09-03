// src/components/eventos/EventoCard.tsx
// Card de evento para la grilla. Lee el tema del ciclo (estilo_tema) vía getTema.
// Clickeable: abre la modal expandida. El botón Reservar NO va acá (solo en la
// modal) — la grilla invita a explorar, la modal convierte.
"use client";

import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import { getTema } from "@/lib/evento-tema";
import type { PublicEvent } from "@/lib/shows-data";

interface Props {
  evento: PublicEvent;
  estiloTema: string | null;
  superficie?: "dark" | "light";   // ← nuevo
  onClick: () => void;
}

// ¿El evento es hoy? Para el badge LIVE. Compara en zona AR.
function esHoy(fecha: string): boolean {
  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return fecha === hoyAr;
}

export default function EventoCard({ evento, estiloTema, superficie="dark", onClick }: Props) {
  const tema = getTema(estiloTema, superficie);
  const esShow = estiloTema === "red";
  const hoy = esShow && esHoy(evento.fecha);
  const dark = superficie === "dark";
  const esMesaIdioma = estiloTema === "uk-flag" || estiloTema === "it-flag";

  const fechaObj = new Date(`${evento.fecha}T${evento.hora}`);
  const diaStr = fechaObj.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });
  const horaStr = fechaObj.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });

  const precioTexto = evento.es_gratuito || !evento.precio
    ? "Entrada libre"
    : `$${evento.precio}`;
  const gratis = evento.es_gratuito || !evento.precio;

 return (
    <button
      onClick={onClick}
      className={`text-left ${tema.fondo} border rounded-none overflow-hidden group hover:-translate-y-1 transition-transform duration-300 w-full h-full flex flex-col ${dark ? "border-white/10" : "border-black/10 shadow-sm"}`}
    >
      {/* Franja: primer hijo, sin nada que la despegue del borde */}
      {tema.segmentos ? (
        <div className="h-1 w-full flex shrink-0">
          {tema.segmentos.map((c, i) => <span key={i} className="flex-1" style={{ backgroundColor: c }} />)}
        </div>
      ) : (
        <div className="h-1 w-full shrink-0" style={{ backgroundColor: tema.flagbarColor }} />
      )}

      {/* Imagen 4:5 — pido el mismo aspecto que el contenedor (g_auto ya recorta bien) */}
      <div className="relative aspect-[5/4] bg-neutral-900 overflow-hidden">
        {evento.url_imagen && (
          <Image
            src={getOptimizedImageUrl(evento.url_imagen,600, 480)}
            alt={evento.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        )}
        {hoy && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#C41E34] text-white text-[11px] font-bold uppercase tracking-[0.18em] px-2.5 py-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live · Hoy
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col flex-1">
        {/* Mesa de idioma: el ciclo ES el título (no hay título propio).
            Resto de eventos: ciclo como acento + título propio. */}
        {esMesaIdioma ? (
          <>
            <div className="flex justify-between items-end gap-3 mb-2">
              <h3 className={`font-serif text-xl font-bold leading-tight ${tema.ciclo}`}>
                {evento.ciclos?.nombre ?? ""}
              </h3>
              <div className={`text-right leading-tight shrink-0 ${dark ? "text-neutral-400" : "text-neutral-600"}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                <span className={`block font-semibold text-sm capitalize ${dark ? "text-white" : "text-neutral-900"}`}>{diaStr}</span>
                <span className="text-xs">{horaStr}hs</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start gap-3 mb-2">
              <span className={`text-[13px] uppercase tracking-[0.2em] font-semibold ${tema.ciclo}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                {evento.ciclos?.nombre ?? ""}
              </span>
              <div className={`text-right leading-tight shrink-0 ${dark ? "text-neutral-400" : "text-neutral-600"}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                <span className={`block font-semibold text-sm capitalize ${dark ? "text-white" : "text-neutral-900"}`}>{diaStr}</span>
                <span className="text-xs">{horaStr}hs</span>
              </div>
            </div>
            <h3 className={`font-serif text-lg font-bold leading-tight mb-2 ${dark ? "text-white" : "text-neutral-900"}`}>{evento.titulo}</h3>
          </>
        )}

        {evento.descripcion && (
          <p className={`text-sm leading-relaxed line-clamp-2 mb-3 ${dark ? "text-neutral-400" : "text-neutral-600"}`}>{evento.descripcion}</p>
        )}
        <p className="font-serif font-bold text-lg mt-auto pt-1 text-right" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          <span className={gratis ? "text-[#fafafa]" : dark ? "text-white" : "text-neutral-900 "}>
            {precioTexto}
          </span>
        </p>
      </div>
    </button>
  );
}