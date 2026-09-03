"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { whatsappLink, WA_MESSAGES } from "@/lib/config";
import EventoModal from "@/components/eventos/EventoModal";
import type { PublicEvent } from "@/lib/shows-data";
import { getTema } from "@/lib/evento-tema";
import { useState, useRef, useEffect } from "react";

const TZ = "America/Argentina/Buenos_Aires";
const HORA_FMT: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ };

function esHoy(fecha: string): boolean {
  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return fecha === hoyAr;
}

function LiveTodayBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-brand-red-100 text-brand-white-100 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-white-100 animate-pulse" />
      Live today
    </div>
  );
}

export default function AgendaPreview({
  shows, whatsappNumero,
}: { shows: PublicEvent[]; whatsappNumero: string }) {
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState(0); // móvil: el más próximo abierto
  const [abierto, setAbierto] = useState<PublicEvent | null>(null);

  if (!shows || shows.length === 0) return null;

  const temaDe = (ev: PublicEvent) => ev.ciclos?.estilo_tema ?? null;

  return (
    <section className="bg-brand-black-100 py-12 lg:py-16 overflow-hidden w-full">
      <style>{`
        @keyframes bmTitleMarq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .bm-title-marq { animation: bmTitleMarq 12s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .bm-title-marq { animation: none; } }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 mb-8 lg:mb-12 flex flex-col items-center lg:items-start">
        <span className="flex items-center gap-2 font-sans font-bold text-brand-red-200 tracking-widest text-xs uppercase mb-2">
          <span className="w-2 h-2 rounded-sm bg-brand-red-100 animate-pulse" />
          Live this week
        </span>
        <h2 className="font-serif font-bold text-brand-white-100 text-4xl lg:text-7xl tracking-tight text-center lg:text-left">
          Próximos eventos
        </h2>
      </div>

      {/* ══ DESKTOP: acordeón horizontal ══ */}
      <div className="hidden lg:flex w-full max-w-[95vw] mx-auto h-[60vh] gap-2 px-4">
        {shows.map((show, index) => (
          <DesktopAccordionCard
            key={show.id}
            show={show}
            isExpanded={hoveredIndex === index}
            onHover={() => setHoveredIndex(index)}
            onOpen={() => setAbierto(show)}
          />
        ))}
      </div>

      {/* ══ MÓVIL: acordeón vertical ══ */}
      <div className="lg:hidden flex flex-col gap-2.5 px-4 max-w-xl mx-auto">
        {shows.map((show, index) => (
          <MobileAccordionRow
            key={show.id}
            show={show}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(index)}
            onOpenModal={() => setAbierto(show)}
          />
        ))}
      </div>

      <div className="flex w-full justify-center mt-10 px-4">
        <Link
          href="/agenda"
          className="font-sans font-bold tracking-[0.2em] uppercase text-sm border-b-2 border-brand-red-100 pb-2 hover:text-brand-red-100 transition-colors"
        >
          Ver agenda completa
        </Link>
      </div>

      <EventoModal
        evento={abierto}
        estiloTema={abierto ? temaDe(abierto) : null}
        superficie="dark"
        whatsappNumero={whatsappNumero}
        onClose={() => setAbierto(null)}
      />
    </section>
  );
}

/* ══════════ DESKTOP ══════════ */
function DesktopAccordionCard({
  show, isExpanded, onHover, onOpen,
    }: { show: PublicEvent; isExpanded: boolean; onHover: () => void; onOpen: () => void }) {
    const tema = getTema(show.ciclos?.estilo_tema ?? null, "dark");
    const wpUrl = whatsappLink(WA_MESSAGES.reservaShow(show.titulo, show.fecha));
    const dateObj = new Date(`${show.fecha}T${show.hora}`);
    const fechaStr = dateObj.toLocaleDateString("es-AR", { day: "numeric", month: "long", timeZone: "America/Argentina/Buenos_Aires" });
    const fechaCorta = dateObj.toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "America/Argentina/Buenos_Aires" });
    const hoy = esHoy(show.fecha);

  return (
    <motion.div
      onMouseEnter={onHover}
      onClick={onOpen}
      animate={{ flexGrow: isExpanded ? 4.2 : 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full min-w-[112px] flex-1 basis-0 overflow-hidden bg-brand-black-200 border border-brand-black-300 cursor-pointer group"
    >
      <Image
        src={getOptimizedImageUrl(show.url_imagen)}
        alt={show.titulo}
        fill
        sizes="(max-width: 1024px) 80vw, 40vw"
        className={`object-cover transition-all duration-500 ${isExpanded ? "opacity-70" : "opacity-40 grayscale scale-105"}`}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/25 to-black/55" />

      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {hoy && !isExpanded && (
            <span className="w-2 h-2 rounded-full bg-brand-red-100 animate-pulse shrink-0" aria-label="En vivo hoy" />
          )}
          <span className="text-brand-white-100 font-bold text-[12px] uppercase tracking-widest border-b-2 border-brand-red-100 pb-1 whitespace-nowrap">
            {isExpanded ? fechaStr : fechaCorta}
          </span>
        </div>
        {isExpanded && !hoy && (
          <span className="text-[10px] uppercase tracking-widest text-brand-white-300/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Click para ver detalle
          </span>
        )}
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
        <h3 className={`font-serif font-bold text-brand-white-100 transition-all duration-300 leading-tight mb-2 ${isExpanded ? "text-4xl" : "text-xl line-clamp-2"}`}>
          {show.titulo}
        </h3>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between pt-4 border-t border-brand-white-300/20"
          >
            <span className={`text-sm font-bold uppercase tracking-widest max-w-[16ch] leading-tight ${tema.ciclo}`}>
              {show.ciclos?.nombre || "Música en vivo"}
            </span>
            <div className="flex flex-col items-end gap-2">
              <span className="text-brand-white-100 font-bold text-lg">
                {show.es_gratuito || !show.precio ? "Entrada libre" : `$${show.precio}`}
              </span>
              
                <a href={wpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-brand-red-100 text-brand-white-100 px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-brand-red-200 transition-colors shadow-lg"
              >
                Reservar
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════ MÓVIL ══════════ */
function MobileAccordionRow({
  show, isOpen, onToggle, onOpenModal,
}: { show: PublicEvent; isOpen: boolean; onToggle: () => void; onOpenModal: () => void }) {
  const tema = getTema(show.ciclos?.estilo_tema ?? null, "dark");
  const wpUrl = whatsappLink(WA_MESSAGES.reservaShow(show.titulo, show.fecha));
  const f = new Date(`${show.fecha}T${show.hora}`);
  const dia = f.toLocaleDateString("es-AR", { day: "numeric", timeZone: TZ });
  const diaSem = f.toLocaleDateString("es-AR", { weekday: "short", timeZone: TZ });
  const hora = f.toLocaleTimeString("es-AR", HORA_FMT);
  const hoy = esHoy(show.fecha);

  // Mesa de idiomas u otros sin nombre propio: el ciclo pasa a ser el título.
  const tieneTitulo = Boolean(show.titulo?.trim());
  const eyebrow = tieneTitulo ? show.ciclos?.nombre : null;
  const displayTitle = tieneTitulo ? show.titulo : (show.ciclos?.nombre ?? "Evento");

  // Marquee solo si el título desborda (no anima los que entran).
  const titleRef = useRef<HTMLSpanElement>(null);
  const [scrollTitle, setScrollTitle] = useState(false);
  useEffect(() => {
    const el = titleRef.current;
    if (el && el.scrollWidth > el.clientWidth + 1) setScrollTitle(true);
  }, [displayTitle]);

  const handleHeader = () => (isOpen ? onOpenModal() : onToggle());

  return (
    <div className={`overflow-hidden border bg-brand-black-200 transition-colors ${isOpen ? "border-brand-gold/30" : "border-brand-black-300"}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleHeader}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleHeader(); } }}
        className="w-full flex items-center gap-3 p-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
      >
        {/* IZQUIERDA: fecha, o LIVE TODAY + hora si es hoy */}
        {hoy ? (
          <span className="flex flex-col items-center justify-center min-w-[54px] leading-tight bg-brand-red-100/10 border border-brand-red-100/40 px-1.5 py-1.5">
            <span className="flex items-center gap-1 text-brand-red-100 text-[8px] font-bold uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-brand-red-100 animate-pulse" /> Live
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-brand-white-100/70">Today</span>
            <span className="text-sm font-bold text-brand-white-100 mt-0.5">{hora}</span>
          </span>
        ) : (
          <span className="flex flex-col items-center min-w-[54px] leading-none">
            <span className="text-2xl font-bold text-brand-white-100 tabular-nums">{dia}</span>
            <span className="text-[9px] uppercase tracking-widest text-brand-white-300/50 mt-0.5">{diaSem}</span>
            <span className="text-[10px] font-bold text-brand-gold mt-0.5">{hora}</span>
          </span>
        )}

        <span className="w-px self-stretch bg-brand-black-300 my-1" />

        {/* CUERPO */}
        <span className="flex-1 min-w-0">
          {/* fila superior: ciclo + (+ / + info) — alineados y centrados */}
          <span className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-[0.16em] truncate ${tema.ciclo}`}>
              {eyebrow ?? "\u00A0"}
            </span>
            <span className={`shrink-0 font-sans font-bold text-[10px] uppercase tracking-[0.14em] whitespace-nowrap ${isOpen ? "text-brand-gold" : "text-brand-white-300/40"}`}>
              {isOpen ? "+ info" : "+"}
            </span>
          </span>

          {/* título: una línea, marquee si desborda */}
          {scrollTitle ? (
            <span className="block overflow-hidden mt-0.5">
              <span className="inline-flex whitespace-nowrap bm-title-marq">
                <span className="font-serif font-bold text-brand-white-100 text-[0.95rem] leading-tight pr-10">{displayTitle}</span>
                <span aria-hidden="true" className="font-serif font-bold text-brand-white-100 text-[0.95rem] leading-tight pr-10">{displayTitle}</span>
              </span>
            </span>
          ) : (
            <span ref={titleRef} className="block truncate font-serif font-bold text-brand-white-100 text-[0.95rem] leading-tight mt-0.5">
              {displayTitle}
            </span>
          )}
        </span>
      </div>

      {/* PANEL: solo precio + reservar */}
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="mx-3 border-t border-brand-white-300/15">
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="font-sans font-bold text-brand-white-100 text-[0.95rem]">
                {show.es_gratuito || !show.precio ? "Entrada libre" : `$${show.precio}`}
              </span>
              
               <a href={wpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-brand-red-100 text-brand-white-100 px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-widest hover:bg-brand-red-200 transition-colors"
              >
                Reservar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}