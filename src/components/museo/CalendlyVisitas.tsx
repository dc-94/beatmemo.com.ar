// src/components/museo/CalendlyVisitas.tsx
"use client";

import { useState } from "react";
import { CALENDLY_VISITAS, whatsappLink } from "@/lib/config";

type Idioma = keyof typeof CALENDLY_VISITAS;

export default function CalendlyVisitas() {
  const [idioma, setIdioma] = useState<Idioma | null>(null);

  // PASO 1 — elección de idioma. Sin opción preseleccionada.
  if (!idioma) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <p className="text-center font-sans font-bold tracking-[0.2em] uppercase text-xs text-[#E6C987] mb-2">
          Paso 1 de 2
        </p>
        <p className="text-center font-serif text-2xl lg:text-3xl text-brand-white-100 mb-8">
          ¿En qué idioma será la visita?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(CALENDLY_VISITAS) as Idioma[]).map((k) => {
            const op = CALENDLY_VISITAS[k];
            return (
              <button
                key={k}
                type="button"
                onClick={() => setIdioma(k)}
                className="group flex flex-col items-center justify-center gap-2 py-12 px-6
                           bg-[#111111] border border-[#8B6D3B]/30
                           hover:border-[#C5A059] hover:bg-[#161616]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]
                           transition-colors"
              >
                <span className="font-serif text-3xl lg:text-4xl text-[#E6C987] group-hover:text-[#C5A059] transition-colors">
                  {op.label}
                </span>
                <span className="font-sans text-brand-white-300 text-sm">{op.ayuda}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // PASO 2 — calendario del idioma elegido.
  const sel = CALENDLY_VISITAS[idioma];
  const otro: Idioma = idioma === "es" ? "en" : "es";

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* CONFIRMACIÓN — contraste máximo: dorado sólido, texto negro, con
          check. Es la última defensa visual contra reservar el idioma
          equivocado, así que grita a propósito. */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#C5A059] px-5 py-4">
        <span className="flex items-center gap-2.5 font-sans font-bold uppercase tracking-[0.15em] text-black text-sm">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Reservando: visita en{" "}
          <strong className="font-serif text-lg tracking-normal normal-case">{sel.label}</strong>
        </span>

        {/* Cambio DIRECTO al otro idioma: nombra el destino, no la acción
            genérica. Un clic en vez de volver al selector. */}
        <button
          type="button"
          onClick={() => setIdioma(otro)}
          className="font-sans font-bold uppercase tracking-widest text-[11px] text-black
                     border-2 border-black/70 px-3 py-1.5
                     hover:bg-black hover:text-[#C5A059] transition-colors"
        >
          Cambiar a {CALENDLY_VISITAS[otro].label}
        </button>
      </div>

      {/* MÓVIL: alto muy generoso. Los iframes de Calendly NO auto-ajustan
          (confirmado en su doc) y el scroll interno en táctil es pésimo.
          La solución no es scrollear mejor: es que TODO entre sin scroll. */}
      <div
        className="h-[1250px] sm:h-[900px] md:h-[700px] min-w-[320px]
                   bg-[#111111] border border-[#8B6D3B]/30 border-t-0 shadow-2xl overflow-hidden"
      >
        <iframe
          key={idioma}
          src={sel.url}
          title={`Reservar visita guiada en ${sel.label}`}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>

      <p className="mt-6 text-center text-brand-white-300 text-sm">
        ¿Tenés dudas antes de reservar?{" "}
        
        <a  href={whatsappLink("Hola! Quiero consultar por una visita guiada para mi institución educativa.")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C5A059] font-bold border-b border-[#C5A059] pb-0.5 hover:text-[#E6C987] hover:border-[#E6C987] transition-colors"
        >
          Escribinos por WhatsApp
        </a>
      </p>
    </div>
  );
}