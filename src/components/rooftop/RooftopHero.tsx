"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import RooftopWordmark from "./RooftopWordmark";
import type { HeroData } from "@/lib/rooftop-hero";

/** Hero full-screen con Ken Burns + crossfade. Sin intro. */
export default function RooftopHero({ hero }: { hero: HeroData }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const imgs = hero.imagenes;

  useEffect(() => {
    if (reduce || imgs.length <= 1) return;
    const id = setInterval(() => setI((n) => (n + 1) % imgs.length), 5500);
    return () => clearInterval(id);
  }, [reduce, imgs.length]);

  return (
    <header id="top" className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-[#0c0c0b]">
      <style>{`
        @keyframes rtKenburns{0%{transform:scale(1.03)}100%{transform:scale(1.15)}}
        .rt-kb{animation:rtKenburns 16s ease-in-out infinite alternate}
        @keyframes rtCue{0%{transform:scaleY(.3);transform-origin:top}50%{transform:scaleY(1)}100%{transform:scaleY(.3);transform-origin:bottom}}
        .rt-cue::after{content:"";width:1px;height:34px;background:linear-gradient(rgba(255,255,255,.8),transparent);animation:rtCue 2s infinite}
        @media(prefers-reduced-motion:reduce){.rt-kb,.rt-cue::after{animation:none!important}}
      `}</style>

      {imgs.map((src, idx) => (
        <motion.div key={src + idx} className="absolute inset-0" initial={false}
          animate={{ opacity: reduce ? (idx === 0 ? 1 : 0) : idx === i ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}>
          <div className={`relative h-full w-full ${reduce ? "" : "rt-kb"}`}>
            <Image src={src} alt="" fill priority={idx === 0} sizes="100vw" className="object-cover brightness-[0.52]" />
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 px-6 py-8 text-white">
        <div className="inline-block">
          <RooftopWordmark className="w-[min(86vw,560px)] mx-auto" />
          <div className="flex items-center justify-end gap-2 mt-2 pr-[2%] text-white/85">
            <span className="text-[0.95rem] tracking-[0.18em] uppercase font-light">by</span>
            <Image src="/brand/logo_BLANCO.svg" alt="Beatmemo" width={180} height={32} className="h-[22px] w-auto" />
          </div>
        </div>

        {hero.subtitulo && (
          <p className="mt-6 text-[0.72rem] tracking-[0.26em] uppercase text-white/70 font-bold">{hero.subtitulo}</p>
        )}

        <h1 className="font-sans font-light text-[clamp(1.2rem,3.4vw,1.8rem)] max-w-[26ch] mx-auto my-6 leading-snug text-white/90">
          {hero.titulo}
        </h1>

        {hero.cuerpo && (
          <p className="text-white/70 text-[0.95rem] max-w-[40ch] mx-auto -mt-2 mb-6 leading-relaxed">{hero.cuerpo}</p>
        )}

        {hero.cta_label && (
          <a href={hero.cta_url || "#cotizar"} className="inline-block bg-white text-[#141211] px-8 py-3.5 uppercase tracking-[0.16em] font-bold text-[0.76rem] hover:bg-white/90 transition">
            {hero.cta_label}
          </a>
        )}
      </div>

      <div className="rt-cue absolute bottom-7 left-1/2 -translate-x-1/2 z-10 text-white/70 text-[0.64rem] tracking-[0.3em] uppercase flex flex-col items-center gap-2">
        Scroll
      </div>
    </header>
  );
}