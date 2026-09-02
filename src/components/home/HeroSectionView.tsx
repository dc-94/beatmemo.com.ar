// src/components/home/HeroSectionView.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface TickerItem {
  when: string;
  text: string;
  tag?: string;
  live?: "today" | "soon";
}

const SLIDES = [
  { word: "el pub", img: "/placeholders/hero/food.jpeg", alt: "Gastronomía y barra de Beatmemo" },
  { word: "los shows", img: "/placeholders/hero/show.jpeg", alt: "Show en vivo en Beatmemo" },
  { word: "nuestro museo", img: "/placeholders/hero/cultural.jpeg", alt: "Museo temático de Beatmemo" },
];

const WORDS = ["el pub", "los shows", "nuestro museo"];

export default function HeroSectionView({
  titulo,
  eyebrow,
  bajada,
  tickerItems,
}: {
  titulo: string;
  eyebrow: string;
  bajada: string;
  tickerItems: TickerItem[];
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, [reduce]);

  const hasTicker = tickerItems.length > 0;

  return (
    <section className="relative w-full h-[60vh] min-h-[480px] overflow-hidden bg-brand-black-100 flex flex-col justify-end">
      <style>{`
        @keyframes bmKenburns {0%{transform:scale(1.02) translate(0,0)}100%{transform:scale(1.14) translate(-2%,-2%)}}
        @keyframes bmSweep {0%{transform:translateX(-45%)}50%{transform:translateX(45%)}100%{transform:translateX(-45%)}}
        @keyframes bmGrain {0%{transform:translate(0,0)}33%{transform:translate(-3%,2%)}66%{transform:translate(2%,-2%)}100%{transform:translate(0,0)}}
        @keyframes bmWheel {0%{opacity:0;transform:translate(-50%,0)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,12px)}}
        @keyframes bmMarquee {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .bm-kenburns{animation:bmKenburns 18s ease-in-out infinite alternate}
        .bm-sweep{animation:bmSweep 9s ease-in-out infinite}
        .bm-grain{animation:bmGrain .5s steps(3) infinite}
        .bm-wheel{animation:bmWheel 1.8s ease-in-out infinite}
        .bm-marquee{animation:bmMarquee 34s linear infinite}
        .bm-ticker-mask:hover .bm-marquee{animation-play-state:paused}
        .bm-grain-bg{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
        @media (prefers-reduced-motion: reduce){.bm-kenburns,.bm-sweep,.bm-grain,.bm-wheel,.bm-marquee{animation:none!important}}
      `}</style>

      {SLIDES.map((s, i) => (
        <div key={s.img} className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}>
          <div className={`relative h-full w-full ${reduce ? "" : "bm-kenburns"}`}>
            <Image src={s.img} alt={s.alt} fill priority={i === 0} className="object-cover opacity-70" sizes="100vw" />
          </div>
        </div>
      ))}

      {!reduce && (
        <div className="pointer-events-none absolute inset-[-30%] z-[2] bm-sweep" style={{ background: "linear-gradient(115deg, transparent 38%, rgba(197,160,89,.14) 48%, rgba(230,201,135,.05) 52%, transparent 62%)" }} />
      )}
      <div className="pointer-events-none absolute inset-0 z-[3] mix-blend-overlay opacity-10 bm-grain-bg bm-grain" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-brand-black-100 via-brand-black-100/35 to-brand-black-100/55" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-r from-brand-black-100/75 to-transparent" />

      <div className={`relative z-[4] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hasTicker ? "pb-28 lg:pb-32" : "pb-20 lg:pb-24"}`}>
        <span className="text-brand-gold uppercase tracking-[0.32em] text-[11px] font-bold block mb-5">{eyebrow}</span>
        <h1 className="font-serif font-bold text-brand-white-100 leading-[1.02] tracking-tight text-4xl sm:text-5xl lg:text-6xl max-w-[16ch]">{titulo}</h1>
        {bajada && <p className="mt-4 max-w-[46ch] font-sans text-brand-white-300 text-sm lg:text-base leading-relaxed">{bajada}</p>}
        <div className="mt-5 flex items-baseline gap-2.5">
          <span className="font-serif text-brand-white-100 text-xl lg:text-3xl">Descubrí</span>
          <span className="relative inline-flex items-center overflow-hidden h-[1.6em] leading-none text-xl lg:text-3xl">
            <AnimatePresence mode="wait">
               <motion.span
                key={SLIDES[index].word}
                initial={reduce ? { opacity: 0 } : { y: "110%", opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { y: "0%", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: "-110%", opacity: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 22 }}
                className="font-serif italic text-accent-gold-vibrant whitespace-nowrap"
              >
                {SLIDES[index].word}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>

      {hasTicker && (
        <div className="absolute bottom-0 left-0 right-0 z-[4] h-[44px] flex items-center border-t border-brand-white-300/10 border-l-[3px] border-l-brand-red-100 bg-brand-black-100/55 backdrop-blur-sm pl-4">
          <div className="bm-ticker-mask flex-1 overflow-hidden relative h-full" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, #000 4%, #000 96%, transparent)", maskImage: "linear-gradient(to right, transparent, #000 4%, #000 96%, transparent)" }}>
            <div className="bm-marquee absolute left-0 flex items-center gap-14 h-full whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map((it, i) => (
                <span key={i} className="inline-flex items-center gap-8 font-sans text-[13px] tracking-wide uppercase text-brand-white-300">
                  <span className="text-brand-gold text-[8px]">◆</span>
                  {it.live && (
                    <span className={`font-bold ${it.live === "today" ? "text-brand-red-100" : "text-brand-white-300/70"}`}>
                      {it.live === "today" ? "Live today" : "Live"}
                    </span>
                  )}
                  <span className="text-accent-gold-vibrant font-bold">{it.when}</span>
                  <b className="text-brand-white-100 font-bold normal-case">{it.text}</b>
                  {it.tag && <span className="text-brand-white-300/70">— {it.tag}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}