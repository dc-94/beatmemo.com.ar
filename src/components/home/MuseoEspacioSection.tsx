"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import EscuelasAviso from "@/components/museo/EscuelasAviso";
import { GOOGLE_REVIEW_URL } from "@/lib/config";
import EspacioCarrusel from "@/components/pub/EspacioCarrusel";
import type { SiteContent } from "@/lib/site-content";
import type { MuseoVisitas } from "@/lib/site-config";

interface Foto { id: string; imagen_url: string; titulo: string | null; epigrafe: string | null; es_museo?: boolean; }

export default function MuseoEspacioSection({
  contenido, fotos, museoVisitas,
}: {
  contenido: SiteContent | null;
  fotos: Foto[];
  museoVisitas: MuseoVisitas;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const g = museoVisitas.guia_gratuita;

  return (
    <section ref={ref} className="w-full bg-[#F5F1EA] text-[#1A1A1A] py-16 sm:py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 lg:gap-16">

        {/* 1 · INTRO: el bar es el museo + números */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
          className="max-w-3xl">
          <span className="text-[#8A6D2F] uppercase tracking-[0.3em] text-[10px] font-bold block mb-4">
            {contenido?.subtitulo ?? "Cultura & Legado"}
          </span>
          <h2 className="font-serif font-bold text-4xl lg:text-6xl leading-tight mb-5">
            {contenido?.titulo ?? "El bar es el museo."}
          </h2>
          <p className="text-[#5C5852] leading-relaxed mb-8">
            {contenido?.cuerpo ??
              "En Beatmemo no hay una línea entre comer y recorrer la historia: cada rincón es parte de una colección que celebra el legado de los cuatro grandes. Comés, tomás algo y viajás en el tiempo, todo a la vez."}
          </p>
          <div className="flex gap-8 border-t border-[#1A1A1A]/10 pt-6">
            <div>
              <span className="block font-serif font-bold text-3xl lg:text-4xl text-[#8A6D2F]">13</span>
              <span className="text-[#5C5852] text-xs uppercase tracking-wider">años de historia</span>
            </div>
            <div>
              <span className="block font-serif font-bold text-3xl lg:text-4xl text-[#8A6D2F]">1/3</span>
              <span className="text-[#5C5852] text-xs uppercase tracking-wider">de la colección privada, expuesta</span>
            </div>
          </div>
        </motion.div>

        {/* 2 · BENTO ÚNICO: bar + museo mezclados (el título dice de dónde es) */}
        <EspacioCarrusel fotos={fotos} />

        {/* 3 · VISITAS + RESEÑAS lado a lado (desktop) sobre fondo oscuro */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Visitas */}
          <div className="bg-brand-black-100 border border-[#8B6D3B]/25 rounded-sm p-8 lg:p-10 flex flex-col justify-center text-center lg:text-left">
            <span className="text-[#C5A059] uppercase tracking-[0.34em] text-[10px] font-bold block mb-3">Viví el museo</span>
            <h3 className="font-serif font-bold text-2xl lg:text-3xl text-brand-white-100 mb-2">Recorrelo con una visita guiada</h3>
            <p className="text-brand-white-300 text-sm mb-6 max-w-md lg:mx-0 mx-auto">
              Free Tour {g?.dia} {g?.hora} hs · Visitas privadas · Escuelas.
            </p>
            <Link href="/museo/visitas-guiadas"
              className="inline-flex items-center justify-center lg:justify-start gap-2 bg-[#C5A059] text-black px-7 py-3.5 font-bold uppercase tracking-widest text-xs hover:bg-[#E6C987] transition-colors w-fit mx-auto lg:mx-0">
              Ver las visitas guiadas <ArrowRight size={15} />
            </Link>
            {museoVisitas.escuelas.reservas_modo === "mensaje" && (
              <div className="mt-5"><EscuelasAviso escuelas={museoVisitas.escuelas} variant="inline" /></div>
            )}
          </div>

          {/* Reseñas */}
          <div className="bg-white border border-black/10 rounded-sm p-8 lg:p-10 flex flex-col justify-center items-center text-center ">

            <p className="font-serif font-bold text-2xl lg:text-3xl text-[#202124] mb-3">¿Ya viviste Beatmemo?</p>

            {/* Rating estilo Google */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#202124] font-bold text-3xl leading-none">4,4</span>
              <span className="flex text-[#FBBC05] text-xl leading-none" aria-label="4,4 de 5 estrellas">★★★★<span className="text-[#FBBC05]/40">★</span></span>
            </div>
            <span className="text-[#5F6368] text-sm mb-6">8.424 reseñas en Google</span>

            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1A73E8] text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-[#1765cc] transition-colors">
              Dejanos tu reseña
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}