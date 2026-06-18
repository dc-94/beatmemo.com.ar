// src/components/home/MuseumPreview.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function MuseumPreview() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    // Sin márgenes, padding generoso, fondo ultra oscuro para contraste tajante
    <section ref={containerRef} className="w-full bg-brand-black-200 pt-24 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-24">
        
        {/* BLOQUE SUPERIOR: Teaser del Museo */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative aspect-[4/3] rounded-none overflow-hidden"
          >
            {/* Recuerda cambiar este src por el placeholder correcto que tengas en tu carpeta */}
            <Image 
              src="/placeholders/museo.jpg" 
              alt="Interior del Museo Beatmemo"
              fill
              className="object-cover opacity-80"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col gap-6"
          >
            <span className="text-brand-white-300 uppercase tracking-[0.3em] text-[10px] font-bold">
              Cultura & Legado
            </span>
            <h2 className="font-serif font-bold text-4xl lg:text-6xl text-brand-white-100 leading-tight">
              Un recorrido por <br/>la historia.
            </h2>
            <p className="font-sans text-brand-white-300 text-base leading-relaxed max-w-lg">
              Beatmemo no es solo un bar, es una cápsula del tiempo. Descubrí nuestra colección exclusiva, recorré los hitos que marcaron una era y viví la experiencia completa del museo a través de nuestras audioguías.
            </p>
            
            <Link 
              href="/museo" 
              className="mt-4 w-fit font-sans font-bold tracking-[0.2em] uppercase text-[11px] border-b-2 border-brand-red-100 pb-1 text-brand-white-100 hover:text-brand-red-100 transition-colors"
            >
              Descubrí el museo
            </Link>
          </motion.div>
        </div>

        {/* BLOQUE INFERIOR: Banner Operativo (Inspirado en el Pub) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="w-full bg-brand-black-100 border border-brand-white-300/10 p-8 lg:p-12 rounded-none flex flex-col gap-10 shadow-2xl"
        >
          {/* Header del Banner */}
          <div className="flex flex-col gap-2 text-center lg:text-left border-b border-brand-white-300/10 pb-8">
            <h3 className="font-serif font-bold text-2xl lg:text-3xl text-brand-white-100 uppercase tracking-wide">
              Visita nuestro museo
            </h3>
            <p className="font-sans text-brand-white-300 text-sm tracking-widest uppercase">
              Abierto todos los días para visitas libres
            </p>
          </div>

          {/* Columnas de Información */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Col 1: Gratuita */}
            <div className="flex flex-col gap-2 border-l-0 md:border-l border-brand-white-300/10 md:pl-8 first:border-0 first:pl-0">
              <span className="text-brand-red-100 font-bold uppercase tracking-widest text-[10px]">Guía Gratuita</span>
              <span className="font-sans text-brand-white-100 font-bold text-sm">Domingos 11:00 hs</span>
              <span className="text-brand-white-300 text-[11px]">Sin reserva previa.</span>
            </div>

            {/* Col 2: Privadas */}
            <div className="flex flex-col gap-2 border-l-0 md:border-l border-brand-white-300/10 md:pl-8">
              <span className="text-brand-red-100 font-bold uppercase tracking-widest text-[10px]">Guías Privadas</span>
              <a 
                href="https://wa.me/5493412023737?text=Hola,%20quisiera%20consultar%20por%20una%20visita%20guiada%20privada%20al%20museo." 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 group w-fit"
              >
                <svg className="w-5 h-5 text-brand-white-100 group-hover:text-green-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.553 4.195 1.604 6.015L.302 24l6.108-1.599A11.96 11.96 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm6.49 17.185c-.276.772-1.6 1.488-2.221 1.523-.591.033-1.353-.131-2.233-.398-.925-.28-2.296-.924-3.959-2.587-1.662-1.662-2.307-3.034-2.587-3.959-.266-.88-.431-1.642-.398-2.233.035-.621.751-1.945 1.523-2.221.246-.086.516-.104.764-.029.215.066.425.267.625.688.271.569.759 1.86.827 1.996.068.136.113.295.023.477-.091.182-.136.295-.273.454-.136.159-.286.341-.409.454-.136.136-.282.285-.125.556.159.273.705 1.163 1.514 1.884.922.822 1.803 1.096 2.075 1.232.273.136.432.114.591-.068.159-.182.682-.795.864-1.068.182-.273.364-.227.614-.136.25.091 1.59.75 1.863.886.273.136.454.204.522.318.068.114.068.659-.208 1.431z"/>
                </svg>
                <span className="font-sans text-brand-white-100 font-bold text-sm border-b border-transparent group-hover:border-brand-white-100 transition-colors">
                  Consultar disponibilidad
                </span>
              </a>
            </div>

            {/* Col 3: Escuelas */}
            <div className="flex flex-col gap-2 border-l-0 md:border-l border-brand-white-300/10 md:pl-8">
              <span className="text-brand-red-100 font-bold uppercase tracking-widest text-[10px]">Instituciones Educativas</span>
              <Link 
                href="/visitas-guiadas" 
                className="font-sans text-brand-white-100 font-bold text-sm border-b border-brand-white-100 w-fit pb-0.5 hover:text-brand-red-100 hover:border-brand-red-100 transition-colors mt-1"
              >
                Reservar para escuelas
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}