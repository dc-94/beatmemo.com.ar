// src/components/home/HeroSection.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const slides = [
  { id: 1, word: "BEATMEMO", img: "/placeholders/hero/fachada.jpeg" },
  { id: 2, word: "BANDAS", img: "/placeholders/hero/show.jpeg" },
  { id: 3, word: "NUESTRA COCINA", img: "/placeholders/hero/food.jpeg" },
  { id: 4, word: "CULTURAL", img: "/placeholders/hero/cultural.jpeg" },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const delay = currentIndex === 0 ? 2000 : 3000;
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, reduce]);

  // Con movimiento reducido: transición instantánea (sin spring, sin desplazamiento).
  const wordTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 200, damping: 20, mass: 1 };
  const wordInitial = reduce ? { opacity: 0 } : { y: "100%", opacity: 0 };
  const wordAnimate = reduce ? { opacity: 1 } : { y: "0%", opacity: 1 };
  const wordExit = reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 };

 return (
    <section className="relative w-full h-[60vh] overflow-hidden bg-brand-black-100 flex items-center justify-center">

      {/* Capa de Imágenes de Fondo. Con movimiento reducido, sin el zoom (scale). */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 ${reduce ? "" : "transition-all duration-[4000ms] ease-out transform"} ${
            index === currentIndex
              ? reduce ? "opacity-40" : "opacity-40 scale-105"
              : reduce ? "opacity-0" : "opacity-0 scale-100"
          }`}
        >
          <Image src={slide.img} alt={`Beatmemo - ${slide.word}`} fill className="object-cover" sizes="100vw" priority={index === 0} />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-brand-black-100 via-brand-black-100/30 to-transparent z-10" />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start justify-center gap-4 md:gap-0 drop-shadow-2xl">
        <div className="w-full md:w-1/3 flex justify-center md:justify-end md:pr-4 lg:pr-6 shrink-0">
          <h1 className="font-sans font-medium text-brand-white-100 text-4xl md:text-5xl lg:text-6xl tracking-wide text-center md:text-right leading-none md:mt-[8px] lg:mt-[16px]">
            Descubrí
          </h1>
        </div>

        <div className="min-h-[140px] md:min-h-[160px] lg:min-h-[260px] overflow-hidden flex items-start justify-center md:justify-start w-full md:w-2/3 md:pl-4 lg:pl-6">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={currentIndex}
              initial={wordInitial}
              animate={wordAnimate}
              exit={wordExit}
              transition={wordTransition}
              className="font-serif font-bold text-accent-gold-vibrant text-6xl md:text-7xl lg:text-9xl tracking-tighter text-center md:text-left block w-full drop-shadow-xl leading-none md:whitespace-pre-wrap break-words"
            >
              {slides[currentIndex].word}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}