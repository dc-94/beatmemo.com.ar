// src/components/eventos/CulturalGrid.tsx
// Grilla de eventos culturales para /nosotros (fondo claro).
// Reutiliza EventoCard/EventoModal con superficie="light".
"use client";

import { useState } from "react";
import EventoCard from "@/components/eventos/EventoCard";
import EventoModal from "@/components/eventos/EventoModal";
import type { PublicEvent } from "@/lib/shows-data";

export default function CulturalGrid({ eventos, whatsappNumero }: { eventos: PublicEvent[]; whatsappNumero: string }) {
  const [abierto, setAbierto] = useState<PublicEvent | null>(null);
  const temaDe = (ev: PublicEvent) => ev.ciclos?.estilo_tema ?? null;

  if (eventos.length === 0) {
    return <p className="text-center text-gray-500 py-12">No hay eventos culturales programados por ahora.</p>;
  }

  return (
    <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
        {eventos.map((ev) => (
          <div key={ev.id} className="w-full max-w-xs">
            <EventoCard evento={ev} estiloTema={temaDe(ev)} superficie="light" onClick={() => setAbierto(ev)} />
          </div>
        ))}
      </div>
    </>
  );
}