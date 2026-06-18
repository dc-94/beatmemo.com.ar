// src/components/home/AgendaPreview.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { getUpcomingShows } from "@/actions/shows";
import { Show } from "@/types/database.types";

export default function AgendaPreview() {
  const [shows, setShows] = useState<Show[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0); // En Desktop, la primera tarjeta arranca expandida

  useEffect(() => {
    async function loadShows() {
      const data = await getUpcomingShows();
      setShows(data.slice(0, 5)); // Máximo 5 bandas
    }
    loadShows();
  }, []);

  if (shows.length === 0) return null; // Evita parpadeos mientras carga

  return (
    <section className="bg-brand-black-100 py-16 lg:py-24 overflow-hidden w-full">
      {/* Encabezado Común */}
      <div className="max-w-7xl mx-auto px-4 mb-8 pl-10 lg:mb-12 flex flex-col items-center lg:items-start">
        <span className="flex items-center gap-2 font-sans font-bold text-brand-red-200 tracking-widest text-md uppercase mb-2">
          <span className="w-2 h-2 rounded-2px bg-brand-red-100 animate-pulse" />
          Live this week
        </span>
        <h2 className="font-serif font-bold text-brand-white-100 text-5xl lg:text-8xl tracking-tight text-center lg:text-left">
          Próximos shows
        </h2>
      </div>

      {/* ========================================================= */}
      {/* 1. DESKTOP: Acordeón Hover (100% VW optimizado a 95vw) */}
      {/* ========================================================= */}
      <div className="hidden lg:flex w-full max-w-[95vw] mx-auto h-[60vh] gap-2 px-4">
        {shows.map((show, index) => (
          <DesktopAccordionCard
            key={show.id}
            show={show}
            isExpanded={hoveredIndex === index}
            onHover={() => setHoveredIndex(index)}
          />
        ))}
      </div>

      <div className="hidden lg:flex max-w-[95vw] mx-auto w-full justify-center mt-8 px-4">
        <Link
          href="/shows"
         className="font-sans font-bold tracking-[0.2em] uppercase text-sm border-b-2 mt-3 border-brand-red-100 pb-3 hover:text-brand-red-100 transition-colors"
        >
          Ver agenda completa
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 2. MOBILE: Carrusel Horizontal 4:5 con CSS Snap */}
      {/* ========================================================= */}
      <div className="lg:hidden flex flex-col w-full items-center">
        {/* Contenedor con scroll snap. El padding deja asomar las cartas laterales */}
            <div className="flex overflow-x-auto snap-x snap-mandatory w-full gap-4 px-[10vw] pb-8 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {shows.map((show) => (
                <MobileCarouselCard key={show.id} show={show} />
                ))}
            </div>

            {/* SOLUCIÓN PRIMARIA: Padre como flex center, enlace limpio */}
            <div className="w-full flex justify-center mt-2 px-4">
                <Link
                href="/shows"
                className="font-sans font-bold tracking-[0.2em] uppercase text-[11px] border-b-2 border-brand-red-100 pb-1 hover:border-brand-white-100 transition-colors"
                >
                Ver Cartelera
                </Link>
            </div>
        </div>
    </section>
  );
}

/* ========================================================= */
/* COMPONENTE: Tarjeta Desktop (Acordeón Mágico) */
/* ========================================================= */
function DesktopAccordionCard({
  show,
  isExpanded,
  onHover,
}: {
  show: Show;
  isExpanded: boolean;
  onHover: () => void;
}) {
  const fechaStr = new Date(show.fecha_hora).toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  const wpText = `Hola! Quiero reservar una mesa para el show de ${show.banda} el ${fechaStr}.`;
  const wpUrl = `https://wa.me/5493412023737?text=${encodeURIComponent(wpText)}`;

  return (
    <motion.div
      onMouseEnter={onHover}
      animate={{ flex: isExpanded ? 4 : 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="relative h-full rounded-2px overflow-hidden bg-brand-black-200 border border-brand-black-300 cursor-pointer group"
    >
      <Image 
        src={show.url_imagen} 
        alt={show.banda} 
        fill 
        sizes="(max-width: 1024px) 50vw, 33vw"
        className={`object-cover transition-all duration-500 ${isExpanded ? "opacity-70 scale-100" : "opacity-40 grayscale scale-105"}`} 
      />
      
      {/* Gradientes: Superior e Inferior para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />

      {/* Fecha superior: Blanca, Bold, con Borde inferior rojo claro */}
      <div className="absolute top-6 left-6 z-20">
        <span className="text-brand-white-100 font-bold text-[12px] uppercase tracking-widest border-b-1 border-brand-red-100 pb-1">
          {fechaStr}
        </span>
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
        {/* Banda */}
        <h3 className={`font-serif font-bold text-brand-white-100 transition-all duration-300 leading-tight mb-2 ${isExpanded ? "text-4xl" : "text-xl line-clamp-2"}`}>
          {show.banda}
        </h3>
        
        {/* Parte expandida */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center justify-between pt-4 border-t border-brand-white-300/20"
          >
            {/* Ciclo a la izquierda */}
            <span className="text-brand-red-100 text-sm font-bold uppercase tracking-widest">
              {show.ciclo}
            </span>

            {/* Precio y Reserva a la derecha (apilados) */}
            <div className="flex flex-col items-end gap-2">
              <span className="text-brand-white-100 font-bold text-lg">
                {show.precio === 0 ? "FREE ACCESS" : `$${show.precio}`}
              </span>
              <a 
                href={wpUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-brand-red-100 text-brand-white-100 px-6 py-2.5 text-xs font-bold uppercase hover:bg-brand-red-200 rounded-sm transition-colors shadow-lg"
              >
                RESERVAR
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ========================================================= */
/* COMPONENTE: Tarjeta Mobile (Snap Carousel 4:5) */
/* ========================================================= */
function MobileCarouselCard({ show }: { show: Show }) {
  const cardRef = useRef(null);
  // El sensor detecta si la tarjeta está ocupando al menos el 70% del viewport visible
  const isInView = useInView(cardRef, { amount: 0.7 });

  const fechaStr = new Date(show.fecha_hora).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  const wpText = `Hola! Quiero reservar una mesa para el show de ${show.banda} el ${fechaStr}.`;
  const wpUrl = `https://wa.me/5493412023737?text=${encodeURIComponent(wpText)}`;

  return (
    <div
      ref={cardRef}
      className="min-w-[80vw] w-[80vw] shrink-0 snap-center relative aspect-[4/5] rounded-2px overflow-hidden bg-brand-black-200 border border-brand-black-300 shadow-2xl"
    >
      <Image
        src={show.url_imagen}
        alt={show.banda}
        fill
        sizes="(max-width: 768px) 80vw, 33vw"
        className={`object-cover transition-opacity duration-500 ${isInView ? "opacity-70" : "opacity-40 grayscale"}`}
      />
      {/* Sutil gradientes  para contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-5">
        <div className="absolute top-6 left-6 z-20">
        <span className="text-brand-white-100 font-bold text-[16px] uppercase tracking-widest border-b-1 border-brand-red-100 pb-1">
          {fechaStr}
        </span>
      </div>
        <div className="flex flex-col gap-1 w-full">
          <h3
            className={`font-serif font-bold text-brand-white-100 tracking-tight transition-all duration-300 ${
              isInView ? "text-3xl" : "text-xl"
            }`}
          >
            {show.banda}
          </h3>
        </div>

        {/* Solo mostramos la info y el botón de reserva si la tarjeta está centrada */}
        <div
          className={`flex items-center justify-between mt-4 pt-4 border-t border-brand-white-300/20 transition-all duration-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col">
            <span className="text-brand-white-100 font-sans font-bold text-sm">
              {show.precio === 0 ? "FREE ACCESS" : `$${show.precio}`}
            </span>
          </div>
          
          <a
            href={wpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-red-100 text-brand-white-100 px-4 py-2 text-[10px] font-sans font-bold tracking-widest uppercase hover:bg-brand-red-200 transition-colors rounded-sm shadow-md"
          >
            Reservar
          </a>
        </div>
      </div>
    </div>
  );
}