
"use client";

import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import { getTema } from "@/lib/evento-tema";
import type { PublicEvent } from "@/lib/shows-data";

function esHoy(fecha: string): boolean {
  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return fecha === hoyAr;
}

export default function EventoCardCompact({
  evento, estiloTema, superficie = "dark", onClick,
}: {
  evento: PublicEvent;
  estiloTema: string | null;
  superficie?: "dark" | "light";
  onClick: () => void;
}) {
  const tema = getTema(estiloTema, superficie);
  const dark = superficie === "dark";
  const hoy = esHoy(evento.fecha);
  const f = new Date(`${evento.fecha}T${evento.hora}`);
  const dia = f.toLocaleDateString("es-AR", { day: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
  const diaSem = f.toLocaleDateString("es-AR", { weekday: "short", timeZone: "America/Argentina/Buenos_Aires" });
  const hora = f.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
  return (
    <button onClick={onClick} className="group text-left w-full flex flex-col bg-brand-black-200 border border-brand-black-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
      <div className="relative w-full aspect-[5/4] overflow-hidden bg-neutral-900">
        {evento.url_imagen && (
          <Image
            src={getOptimizedImageUrl(evento.url_imagen, 500, 400)}
            alt={evento.titulo}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="50vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badge de fecha con fondo (patrón del acordeón) */}
        <div className="absolute top-2 left-2 flex flex-col items-center leading-none bg-black/70 backdrop-blur-sm px-2.5 py-1.5">
          <span className="text-xl font-bold text-brand-white-100 font-sans">{dia}</span>
          <span className="text-[9px] uppercase tracking-widest text-brand-white-300/70">{diaSem}</span>
          <span className="text-[9px] font-bold text-brand-gold mt-0.5">{hora}</span>
        </div>

        {hoy && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-brand-red-100 text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> Hoy
          </span>
        )}
      </div>

      <div className="p-2.5">
        {evento.ciclos?.nombre && (
          <span className={`block text-[9px] font-bold uppercase tracking-[0.18em] truncate ${tema.ciclo}`}>
            {evento.ciclos.nombre}
          </span>
        )}
        <p className={`font-serif font-bold text-sm leading-tight line-clamp-2 mt-0.5 ${dark ? "text-brand-white-100" : "text-brand-black-100"}`}>
          {evento.titulo}
        </p>
      </div>
    </button>
  );
}