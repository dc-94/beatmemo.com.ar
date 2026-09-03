// src/components/eventos/EventoModal.tsx
// Card expandida en modal. Muestra todo el detalle + botón Reservar (WhatsApp).
// Se adapta a superficie (dark/light) igual que EventoCard.
"use client";

import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import { getTema, type Superficie } from "@/lib/evento-tema";
import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import type { PublicEvent } from "@/lib/shows-data";
import { useEffect } from "react";

interface Props {
  evento: PublicEvent | null;
  estiloTema: string | null;
  superficie?: Superficie;
  whatsappNumero: string;
  onClose: () => void;
}

function esHoy(fecha: string): boolean {
  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return fecha === hoyAr;
}


export default function EventoModal({ evento, estiloTema, superficie = "dark", whatsappNumero, onClose }: Props) {
  // El hook va ANTES de cualquier return condicional (regla de hooks).
 const modalRef = useDrawerA11y(!!evento, onClose);

  // Bloquea el scroll del fondo mientras la modal está abierta.
  useEffect(() => {
    if (!evento) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [evento]);


  if (!evento) return null;

  const tema = getTema(estiloTema, superficie);
  const dark = superficie === "dark";
  const esShow = estiloTema === "red";
  const hoy = esShow && esHoy(evento.fecha);

//Eventos pasados
  const yaPaso = (() => {
    const hoyAr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
    return evento.fecha < hoyAr;
  })();

  const fechaObj = new Date(`${evento.fecha}T${evento.hora}`);
  const fechaLarga = fechaObj.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const horaStr = fechaObj.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" , hour12: false, timeZone: "America/Argentina/Buenos_Aires" });

  // Mensaje de WhatsApp con nombre + fecha del evento.
  const mensaje = `Hola! Quiero reservar para "${evento.titulo}" el ${fechaLarga}.`;
  const waLink = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`;

  const fondoModal = dark ? "bg-[#161616]" : "bg-white";
  const textoPrincipal = dark ? "text-white" : "text-neutral-900";
  const textoSec = dark ? "text-neutral-400" : "text-neutral-600";
  const listaIntegrantes = evento.integrantes
    ? evento.integrantes.split(",").map((i) => i.trim()).filter(Boolean)
    : [];
  const esMesaIdioma = estiloTema === "uk-flag" || estiloTema === "it-flag";

  

     return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={evento.titulo}
        onClick={(e) => e.stopPropagation()}
        className={`${fondoModal} border-t-[3px] ${tema.bordeModal} max-w-4xl w-full max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden`}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
        >
          ✕
        </button>
        <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row min-h-0">

        {/* ── IMAGEN: lateral izquierda en desktop, arriba en móvil ── */}
        <div className="relative w-full md:w-[45%] aspect-video md:aspect-auto shrink-0 bg-neutral-900">
          {evento.url_imagen && (
            <Image src={getOptimizedImageUrl(evento.url_imagen, 600, 800)} alt={evento.titulo} fill className="object-cover" sizes="(max-width:768px) 100vw, 45vw" />
          )}
          {hoy && (
            <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#C41E34] text-white text-xs font-bold uppercase tracking-[0.18em] px-3 py-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live · Hoy
            </span>
          )}
        </div>

        {/* ── COLUMNA DE CONTENIDO: scroll arriba + footer fijo abajo ── */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Zona scrolleable */}
          <div className="p-6 lg:p-7 md:overflow-y-auto md:flex-1">
            {/* Header */}
            {esMesaIdioma ? (
              <div className="flex justify-between items-end gap-4 mb-5">
                <h2 className={`font-serif text-2xl lg:text-3xl font-bold leading-tight ${tema.ciclo}`}>
                  {evento.ciclos?.nombre ?? ""}
                </h2>
                <div className={`text-right leading-tight shrink-0 ${textoSec}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  <span className={`block font-semibold ${textoPrincipal} capitalize`}>{fechaLarga}</span>
                  <span className="text-sm">{horaStr} hs</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <span className={`text-xs uppercase tracking-[0.2em] font-semibold ${tema.ciclo}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    {evento.ciclos?.nombre ?? ""}
                  </span>
                  <div className={`text-right leading-tight shrink-0 ${textoSec}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    <span className={`block font-semibold ${textoPrincipal} capitalize`}>{fechaLarga}</span>
                    <span className="text-sm">{horaStr} hs</span>
                  </div>
                </div>
                <h2 className={`font-serif text-2xl lg:text-3xl font-bold leading-tight mb-5 ${textoPrincipal}`}>{evento.titulo}</h2>
              </>
            )}

            {evento.descripcion && (
              <p className={`${textoSec} leading-relaxed mb-5`}>{evento.descripcion}</p>
            )}

            {esShow && listaIntegrantes.length > 0 && (
                <div className={`${dark ? "bg-white/5" : "bg-black/5"} px-4 py-3 rounded-sm`}>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Integrantes</p>
                  <ul className="space-y-1">
                    {listaIntegrantes.map((nombre, i) => (
                      <li key={i} className={`text-sm ${textoPrincipal} flex items-baseline gap-2`}>
                        <span className={tema.ciclo}>·</span>{nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Footer fijo */}
          {!yaPaso && (
            <div className={`shrink-0 flex items-center justify-between gap-4 px-6 lg:px-7 py-4 border-t ${dark ? "border-white/10 bg-[#161616]" : "border-black/10 bg-white"}`}>
              <div className={`font-serif font-bold ${textoPrincipal}`}>
                {evento.es_gratuito || !evento.precio ? (
                  <span className="text-[#5EA671] text-lg">Entrada libre</span>
                ) : (
                  <span className="text-2xl">${evento.precio} <span className={`text-sm ${textoSec}`}>entrada</span></span>
                )}
              </div>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="bg-[#C5A059] hover:bg-[#E6C987] text-black font-semibold text-base uppercase tracking-[0.14em] px-8 py-3.5 transition-colors whitespace-nowrap"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Reservar
              </a>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}