// src/components/home/PubUI.tsx
"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import AtributoBadges from "@/components/pub/AtributoBadges";
import { getOptimizedImageUrl } from "@/lib/utils";

interface PubItem {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  url_imagen: string;
  hero_destacado: boolean;
  es_vegetariano: boolean;
  es_vegano: boolean;
  es_sin_tacc: boolean;
  es_nuevo: boolean;
  es_recomendado: boolean;
}

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] } },
};

// Shuffle determinístico: misma semilla → mismo orden. La semilla es la
// ventana temporal (cambia con revalidate), NO Math.random(). Así el server
// y el cliente producen el MISMO orden (sin hydration mismatch) y el resultado
// cachea, pero cambia entre ventanas. Mulberry32: PRNG chico y estable.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PubUI({ items }: { items: PubItem[] }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  // Hero: primer marcado; si hay 0, cae al primero de la lista (menor orden).
  // Nunca se rompe con 0 ni con N marcados. (Fallback opción 3.)
  // El resto rota por ventana horaria; el hero NO rota (es tu elección curada).
  const { hero, rest } = useMemo(() => {
    if (items.length === 0) return { hero: null, rest: [] as PubItem[] };
    const heroItem = items.find((i) => i.hero_destacado) ?? items[0];
    const others = items.filter((i) => i.id !== heroItem.id);
    const windowSeed = Math.floor(Date.now() / (1000 * 60 * 60)); // cambia cada hora
    return { hero: heroItem, rest: seededShuffle(others, windowSeed) };
  }, [items]);

  return (
    <section
      ref={containerRef}
      className="w-full bg-[#F5F4F0] py-32 lg:py-48 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-32 lg:gap-40">
        {/* BLOQUE A: SPLIT EDITORIAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            variants={fadeUpVariant} initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative w-full aspect-[4/5] lg:aspect-[3/4] rounded-sm overflow-hidden shadow-xl"
          >
            <Image
              src="https://res.cloudinary.com/djmbcrliu/image/upload/v1781528975/DSC_0168_qcrypi.jpg"
              alt="Ambiente Gastronómico Beatmemo"
              fill className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw" 
            />
          </motion.div>
          <motion.div
            variants={fadeUpVariant} initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-col justify-center"
          >
            <span className="text-brand-black-100 uppercase tracking-[0.3em] text-[10px] font-bold mb-6">
              Nuestra Cocina
            </span>
            <h2 className="font-serif font-bold text-4xl lg:text-6xl text-brand-black-100 tracking-tight leading-tight mb-8">
              Classic Pub.<br />Premium Taste.
            </h2>
            <p className="font-sans text-gray-600 text-base lg:text-lg leading-relaxed mb-10 max-w-lg">
              No solo somos el templo del rock, somos el punto de encuentro donde
              la gastronomía de alto vuelo se cruza con la historia. Descubrí
              nuestra selección de hamburguesas artesanales, tapeo de autor y
              coctelería clásica.
            </p>
            <blockquote className="border-l-2 border-accent-gold-vibrant px-6 mt-4 max-w-lg">
              <p className="font-sans text-accent-gold-dark text-sm lg:text-md italic leading-relaxed mb-2">
                En gastronomía se descarta cerca de 2,5&nbsp;kg de comida por local
                cada día, y casi un tercio son sobras que quedan en el plato.
              </p>
              <p className="font-sans text-gray-500 text-sm lg:text-lg font-medium leading-relaxed">
                Cocinamos en cantidad justa: menos desperdicio, más frescura.
                Y si algo te sobra, pedilo para llevar — que no quede nada en el camino.
              </p>
            </blockquote>
          </motion.div>
        </div>

        {/* BLOQUE B: BENTO. Solo si hay items destacados. */}
        {hero && (
          <motion.div
            variants={fadeUpVariant} initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-col gap-8 lg:gap-10"
          >
            <div className="border-b border-brand-black-100/10 pb-6">
              <h3 className="font-serif text-3xl text-brand-black-100">De nuestra cocina</h3>
            </div>

            {/* ZONA SUPERIOR: hero grande (izq) + 2 horizontales apilados (der) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BentoHero item={hero} />
              <div className="flex flex-col gap-6">
                {rest.slice(0, 2).map((item) => (
                  <BentoHorizontal key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* ZONA INFERIOR: hasta 4 verticales, space-between si hay menos */}
            {rest.length > 2 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {rest.slice(2, 6).map((item) => (
                  <BentoVertical key={item.id} item={item} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* BLOQUE C: BANNER CONVERSIÓN — conservá el tuyo si difiere */}
        <motion.div
          variants={fadeUpVariant} initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="w-full bg-brand-black-100 p-10 lg:p-16 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl"
        >
          <div className="max-w-xl">
            <h3 className="font-serif font-bold text-3xl lg:text-4xl text-brand-white-100 leading-tight mb-4 text-center md:text-left">
              Explorá la experiencia completa.
            </h3>
          </div>
          <Link
            href="/pub"
            className="shrink-0 bg-brand-white-100 text-brand-black-100 px-10 py-4 rounded-sm font-sans font-bold tracking-widest uppercase text-xs hover:bg-white transition-colors"
          >
            Descubrí nuestra Carta
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Tarjeta del bento. isHero → ocupa 2x2 y muestra el rótulo de sección encima.
// Deriva comida vs coctelería desde la categoría. Ajustá las keywords a tus
// categorías reales (mirá qué valores tenés en pub_chips).
function getTipoItem(categoria: string): "comida" | "trago" {
  const cat = (categoria || "").trim().toLowerCase();
  const esTrago = cat === "cocktail" || cat === "tragos" || cat === "bebida";
  return esTrago ? "trago" : "comida";
}

// Ícono en glassmorphism, esquina sup-der. Sutil, sin texto, sobrevive en card chica.
function TipoIcon({ categoria }: { categoria: string }) {
  const tipo = getTipoItem(categoria);
  return (
    <div
      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm
                 border border-accent-gold-vibrant flex items-center justify-center text-white/90"
      title={tipo === "trago" ? "Coctelería" : "Cocina"}
      aria-label={tipo === "trago" ? "Coctelería" : "Cocina"}
    >
      {tipo === "trago" ? (
        // copa de cóctel
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16l-8 9z" /><line x1="12" y1="13" x2="12" y2="21" /><line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      ) : (
        // tenedor + cuchillo
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v6a2 2 0 0 0 2 2v10M8 3v5M10 3v5M18 3c-1.5 0-3 1.5-3 5s1.5 4 3 4v9" />
        </svg>
      )}
    </div>
  );
}

// HERO: imagen grande, rótulo + título + descripción + badges sobre degradé.
function BentoHero({ item }: { item: PubItem }) {
  return (
    <div className="group relative overflow-hidden rounded-sm bg-gray-200 aspect-[4/3] lg:aspect-auto lg:min-h-[440px]">
      <TipoIcon categoria={item.categoria} />
      <Image
        src={getOptimizedImageUrl(item.url_imagen, 800, 800)}
        alt={item.nombre} fill
        className="object-cover transition-transform duration-1000 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-7">
        <h4 className="font-sans font-bold text-white uppercase tracking-wide leading-tight text-2xl lg:text-4xl mb-2">
          {item.nombre}
        </h4>
        {item.descripcion && (
          <p className="font-sans text-white/85 text-sm lg:text-base line-clamp-2 max-w-md mb-3">
            {item.descripcion}
          </p>
        )}
        <AtributoBadges item={item} />
      </div>
    </div>
  );
}

// HORIZONTAL: imagen a la izquierda, texto al lado. Para los 2 del costado.
function BentoHorizontal({ item }: { item: PubItem }) {
  return (
    <div className="group flex gap-4 bg-white/50 rounded-sm overflow-hidden p-2 flex-1 min-h-[130px]">
      <div className="relative w-32 lg:w-40 shrink-0 overflow-hidden rounded-sm bg-gray-200">
        <TipoIcon categoria={item.categoria} />
        <Image
          src={getOptimizedImageUrl(item.url_imagen, 320, 320)}
          alt={item.nombre} fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="160px"
        />
      </div>
      <div className="flex flex-col justify-center py-2 pr-2 min-w-0">
        <h4 className="font-sans font-bold text-brand-black-100 uppercase tracking-wide text-base lg:text-lg leading-tight mb-1 truncate">
          {item.nombre}
        </h4>
        {item.descripcion && (
          <p className="font-sans text-gray-600 text-xs lg:text-sm line-clamp-2 mb-2">
            {item.descripcion}
          </p>
        )}
        <AtributoBadges item={item} />
      </div>
    </div>
  );
}

// VERTICAL: título dentro de la imagen, descripción y badges debajo. Para los 4 de abajo.
function BentoVertical({ item }: { item: PubItem }) {
  return (
    <div className="group flex flex-col ">
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm bg-gray-200 mb-3">
        <TipoIcon categoria={item.categoria} />
        <Image
          src={getOptimizedImageUrl(item.url_imagen, 400, 300)}
          alt={item.nombre} fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 300px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <h4 className="absolute bottom-3 left-3 right-3 font-sans font-bold text-white uppercase tracking-wide text-sm lg:text-base leading-tight">
          {item.nombre}
        </h4>
      </div>
      {item.descripcion && (
        <p className="font-sans text-gray-600 text-xs lg:text-sm line-clamp-2 mb-2">
          {item.descripcion}
        </p>
      )}
      <AtributoBadges item={item} compact max={4} />
    </div>
  );
}