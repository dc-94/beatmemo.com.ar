"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";

interface PubItem {
  id: string;
  nombre: string;
  descripcion: string;
  url_imagen: string;
  tags: string[];
}

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 }, // Más distancia de subida para más elegancia
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] } // Curva de animación premium
  },
};

export default function PubUI({ items }: { items: PubItem[] }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    // FONDOS CLAROS: Usamos un beige muy sutil o tu brand-white (puedes ajustar el bg-color a tu gusto, ej: bg-[#F9F9F6])
    <section ref={containerRef} className="w-full bg-[#F5F4F0] py-32 lg:py-48 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-32 lg:gap-40">
        
        {/* BLOQUE A: EL SPLIT EDITORIAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div 
            variants={fadeUpVariant}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            // Esquinas cuadradas (rounded-none) o sutiles (rounded-sm)
            className="relative w-full aspect-[4/5] lg:aspect-[3/4] rounded-sm overflow-hidden shadow-xl"
          >
            <Image 
              src="https://res.cloudinary.com/djmbcrliu/image/upload/v1781528975/DSC_0168_qcrypi.jpg"
              alt="Ambiente Gastronómico Beatmemo"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>

          <motion.div 
            variants={fadeUpVariant}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-col justify-center"
          >
            <span className="text-brand-black-100 uppercase tracking-[0.3em] text-[10px] font-bold mb-6">
              Nuestra Cocina
            </span>
            {/* Texto oscuro para resaltar sobre fondo claro */}
            <h2 className="font-serif font-bold text-4xl lg:text-6xl text-brand-black-100 tracking-tight leading-tight mb-8">
              Classic Pub.<br/>Premium Taste.
            </h2>
            <p className="font-sans text-gray-600 text-base lg:text-lg leading-relaxed mb-10 max-w-lg">
              No solo somos el templo del rock, somos el punto de encuentro donde la gastronomía de alto vuelo se cruza con la historia. Descubrí nuestra selección de hamburguesas artesanales, tapeo de autor y coctelería clásica.
            </p>
          </motion.div>
        </div>

        {/* BLOQUE B: LOS DESTACADOS DINÁMICOS */}
        <motion.div 
          variants={fadeUpVariant}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col gap-16 lg:gap-20"
        >
          <div className="flex items-center justify-between border-b border-brand-black-100/10 pb-6">
            <h3 className="font-serif text-3xl text-brand-black-100">Destacados del Menú</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col group cursor-pointer">
                {/* Esquinas afiladas en las fotos */}
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm mb-6 bg-gray-200">
                  <Image 
                    src={item.url_imagen}
                    alt={item.nombre}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h4 className="font-sans font-bold text-xl text-brand-black-100 mb-2 uppercase tracking-wide">
                  {item.nombre}
                </h4>
                <p className="font-sans text-gray-600 text-sm mb-6 line-clamp-2">
                  {item.descripcion}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {item.tags?.map((chip, index) => (
                    <span key={index} className="px-3 py-1 border border-brand-black-100/20 text-brand-black-100 text-[10px] uppercase tracking-widest rounded-none">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BLOQUE C: BANNER CONVERSIÓN */}
        <motion.div 
          variants={fadeUpVariant}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          // Fondo oscuro para contraste, botón claro
          className="w-full bg-brand-black-100 p-10 lg:p-16 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl"
        >
          <div className="max-w-xl">
            <h3 className="font-serif font-bold text-3xl lg:text-4xl text-brand-white-100 leading-tight mb-4 text-center md:text-left">
              Explorá la experiencia completa.
            </h3>
            <p className="font-sans text-brand-white-300 text-sm md:text-base text-center md:text-left">
              Conocé nuestra carta digital y encontrá tu nuevo plato favorito.
            </p>
          </div>
          <Link 
            href="/menu"
            // Botón con bordes afilados
            className="shrink-0 bg-brand-white-100 text-brand-black-100 px-10 py-5 rounded-none font-sans font-bold tracking-[0.2em] uppercase text-[11px] hover:bg-brand-red-100 hover:text-brand-white-100 transition-colors"
          >
            Ver Menú Completo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}