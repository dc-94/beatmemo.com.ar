// src/components/layout/Footer.tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  // Si estamos en cualquier ruta de admin, devolvemos null (no renderiza nada)
  if (pathname.startsWith("/admin")) return null;
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const text = "BEATMEMO";
  const letters = Array.from(text);

  // Variantes de Framer Motion con tipado estricto
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const letterVariants: Variants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    },
  };

  return (
    <footer 
      ref={containerRef}
      className="relative w-full min-h-[60vh] md:min-h-[80vh] flex flex-col bg-brand-black-100 overflow-hidden"
    >
      {/* CAPA 1: FONDO TEXTO (z-0) - Watermark effect */}
      <div className="absolute inset-0 z-0 flex items-end justify-center pb-4 md:pb-8 pointer-events-none">
        
        {/* MOBILE: Texto estático detrás del contenido */}
        <div className="md:hidden w-full text-center">
          <span className="font-serif font-bold text-brand-gold text-[18vw] leading-none tracking-tighter">
            BEATMEMO
          </span>
        </div>

        {/* DESKTOP: Texto animado detrás del contenido */}
        <motion.div
          className="hidden md:flex w-full justify-center px-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="font-serif font-bold text-brand-gold text-[13vw] xl:text-[14vw] leading-[0.8] tracking-tighter"
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* CAPA 2: CONTENIDO E INFORMACIÓN (z-10) */}
      <div className="relative z-10 w-full flex-grow flex flex-col justify-between bg-black/50 pt-20 pb-8">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Estructura de 3 Columnas con CSS Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            
            {/* Columna 1: Visitanos */}
            <div className="flex flex-col">
              <h3 className="text-brand-white-100 font-sans font-bold tracking-widest uppercase mb-4 text-sm">
                Visitanos
              </h3>
              <p className="text-brand-white-200 font-sans text-sm mb-1">
                Bv. OROÑO 107 bis (Esq. GÜEMES)
              </p>
              <p className="text-brand-white-200 font-sans text-sm">
                Rosario, Santa Fe, Argentina
              </p>
            </div>

            {/* Columna 2: Reserva */}
            <div className="flex flex-col">
              <h3 className="text-brand-white-100 font-sans font-bold tracking-widest uppercase mb-4 text-sm">
                Reserva
              </h3>
              <a 
                href="http://wa.me/5493412023737" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-gold font-sans text-xl font-bold hover:text-accent-gold-vibrant transition-colors group w-fit"
              >
                <svg 
                  className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                3412023737
              </a>
            </div>

            {/* Columna 3: Social */}
            <div className="flex flex-col">
              <h3 className="text-brand-white-100 font-sans font-bold tracking-widest uppercase mb-4 text-sm">
                Social
              </h3>
              <div className="flex flex-col space-y-4">
                
                {/* Instagram */}
                <a 
                  href="https://instagram.com/beatmemo_rosario" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-brand-white-200 hover:text-brand-gold transition-colors font-sans text-sm group w-fit"
                >
                  <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  /BEATMEMO_ROSARIO
                </a>

                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/beatmemopub" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-brand-white-200 hover:text-brand-gold transition-colors font-sans text-sm group w-fit"
                >
                  <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                  BEATMEMO PUB
                </a>

              </div>
            </div>

          </div>

          {/* Fila Inferior: Links Legales y Empleo */}
          <div className="flex flex-wrap gap-4 mt-16 text-brand-white-300 text-xs font-sans items-center md:justify-end">
             <a href="mailto:beatlesmemo.adm@gmail.com" className="font-bold text-brand-white-100 hover:text-brand-gold transition-colors">
               TRABAJA CON NOSOTROS
             </a>
             <span className="hidden md:inline">|</span>
             <Link href="/privacidad" className="hover:text-brand-gold transition-colors">Privacidad</Link>
             <span>|</span>
             <Link href="/terminos" className="hover:text-brand-gold transition-colors">Términos</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}