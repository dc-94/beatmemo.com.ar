// src/components/agenda/AgendaGrid.tsx
"use client";

import { useState } from "react";
import EventoCard from "@/components/eventos/EventoCard";
import EventoModal from "@/components/eventos/EventoModal";
import ArchivoEventos from "@/components/eventos/ArchivoEventos";
import type { PublicEvent } from "@/lib/shows-data";
import EventoCardCompact from "@/components/eventos/EventoCardCompact";

interface Props {
  shows: PublicEvent[];
  whatsappNumero: string;
  // "past" usa el archivo por mes; el resto, grilla de cards.
  modoArchivo?: boolean;
}

export default function AgendaGrid({ shows, whatsappNumero, modoArchivo = false }: Props) {
  const [abierto, setAbierto] = useState<PublicEvent | null>(null);

  if (shows.length === 0) {
    return <p className="text-center text-brand-white-300 py-12">No hay eventos para este período.</p>;
  }

  const temaDe = (ev: PublicEvent) => ev.ciclos?.estilo_tema ?? null;

  return (
    <>
      {modoArchivo ? (
        <ArchivoEventos
          eventos={shows.map((s) => ({ ...s, estilo_tema: s.ciclos?.estilo_tema ?? null }))}
          superficie="dark"
          onEventoClick={(ev) => setAbierto(ev as PublicEvent)}
        />
      ) : (
        <>
          {/* MÓVIL — grilla 2 col compacta */}
          <div className="grid grid-cols-2 gap-4 sm:hidden">
            {shows.map((show) => (
              <EventoCardCompact key={show.id} evento={show} estiloTema={temaDe(show)} superficie="dark" onClick={() => setAbierto(show)} />
            ))}
          </div>
          {/* DESKTOP — card completa */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shows.map((show) => (
              <EventoCard key={show.id} evento={show} estiloTema={temaDe(show)} superficie="dark" onClick={() => setAbierto(show)} />
            ))}
          </div>
        </>
      )}

      <EventoModal
        evento={abierto}
        estiloTema={abierto ? temaDe(abierto) : null}
        superficie="dark"
        whatsappNumero={whatsappNumero}
        onClose={() => setAbierto(null)}
      />
    </>
  );
}