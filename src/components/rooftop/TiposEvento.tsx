"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TIPOS_EVENTO, type TipoEvento } from "@/lib/rooftop-data";

/**
 * Tipos de evento, Z-pattern. El carrusel corre DETRÁS DE TODO EL CONTENEDOR
 * (full-width) y scrollea solo en horizontal. Encima va un gradiente:
 *   - transparente hasta la "línea sólida" (ahí ARRANCA el gradiente),
 *   - sube hasta 90% blanco en la "línea punteada",
 *   - y queda en 90% sobre el texto (la foto se ve apenas, al 10%).
 * El marquee arranca al entrar en viewport.
 */
export default function TiposEvento() {
  return (
    <section id="tipos" className="bg-white py-14 sm:py-20">
      <style>{`
        @keyframes rtMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .rt-track{display:flex;width:max-content;height:100%;animation:rtMarquee 38s linear infinite;animation-play-state:paused}
        .rt-track.rev{animation-direction:reverse}
        .rt-row.run .rt-track{animation-play-state:running}
        .rt-item{position:relative;flex:0 0 auto;width:min(78vw,460px);height:100%}

        /* Gradiente sobre el carrusel. Mobile: el blanco cae abajo (donde va el texto). */
        .rt-grad{position:absolute;inset:0;z-index:1;pointer-events:none;
          background:linear-gradient(to bottom,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 34%,
            rgba(255,255,255,.9) 60%,
            rgba(255,255,255,.9) 100%)}
        @media(min-width:900px){
          /* texto a la IZQUIERDA → 90% blanco a la izquierda, foto a la derecha */
          .rt-grad{background:linear-gradient(to left,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 50%,   /* línea sólida: acá arranca */
            rgba(255,255,255,.9) 66%,  /* línea punteada: llega a 90% */
            rgba(255,255,255,.9) 100%)}
          /* fila invertida: texto a la DERECHA */
          .rt-grad.rev{background:linear-gradient(to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 50%,
            rgba(255,255,255,.9) 66%,
            rgba(255,255,255,.9) 100%)}
        }
        @media(prefers-reduced-motion:reduce){.rt-track{animation:none!important}}
      `}</style>

      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10 mb-6 sm:mb-10">
        <p className="font-extrabold text-[0.72rem] tracking-[0.26em] uppercase text-[#b4ac9c] mb-2">
          Qué se puede hacer acá
        </p>
        <h2 className="font-extrabold text-[clamp(1.9rem,5.5vw,3.1rem)] tracking-tight uppercase leading-[0.95] text-[#141211]">
          Tipos de <span className="font-light">evento</span>
        </h2>
      </div>

      {TIPOS_EVENTO.map((t, idx) => (
        <TipoRow key={t.id} tipo={t} rev={idx % 2 === 1} />
      ))}
    </section>
  );
}

function TipoRow({ tipo, rev }: { tipo: TipoEvento; rev: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // duplicamos las fotos para que el loop a -50% no tenga corte
  const fotos = [...tipo.imagenes, ...tipo.imagenes];

  return (
    <div
      ref={ref}
      className={`rt-row ${run ? "run" : ""} relative bg-white min-h-[clamp(360px,54vh,460px)] grid grid-cols-1 min-[900px]:grid-cols-2 items-center overflow-hidden`}
    >
      {/* Carrusel full-width DETRÁS de todo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className={`rt-track ${rev ? "rev" : ""}`}>
          {fotos.map((src, i) => (
            <div key={`${src}-${i}`} className="rt-item">
              <Image src={src} alt="" fill sizes="(min-width:900px) 46vw, 78vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Gradiente que funde a 90% del lado del texto */}
      <div className={`rt-grad ${rev ? "rev" : ""}`} />

      {/* Texto (sobre el 90% blanco) */}
      <div
        className={`relative z-[2] px-5 sm:px-8 min-[900px]:px-[clamp(1.6rem,4vw,3.4rem)] pt-[clamp(200px,34vh,240px)] pb-9 min-[900px]:py-10 ${
          rev ? "min-[900px]:order-2 min-[900px]:text-right" : ""
        }`}
      >
        <span className="text-[0.78rem] tracking-[0.1em] text-[#b4ac9c]">{tipo.num}</span>
        <h3 className="text-[clamp(1.8rem,7vw,2.7rem)] uppercase tracking-tight leading-[0.95] my-1.5 text-[#141211]">
          <span className="font-extrabold">{tipo.titulo.strong}</span>
          <span className="font-light">{tipo.titulo.light}</span>
        </h3>
        <p className={`text-[#6d685f] text-[0.96rem] leading-relaxed max-w-[34ch] ${rev ? "min-[900px]:ml-auto" : ""}`}>
          {tipo.descripcion}
        </p>
      </div>

      {/* Columna vacía en desktop para que el texto caiga al lado correcto */}
      <div className={`hidden min-[900px]:block ${rev ? "min-[900px]:order-1" : ""}`} aria-hidden />
    </div>
  );
}
