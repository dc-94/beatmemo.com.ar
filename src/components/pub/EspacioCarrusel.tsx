"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { EspacioFoto } from "@/lib/pub-data";

// Anchos variados (en px) que se repiten en ciclo → efecto "tamaños aleatorios"
// sin romper la grilla de 2 filas. El patrón se recorre por índice.
const ANCHOS = [260, 200, 320, 220, 280, 190, 300];

export default function EspacioCarrusel({ fotos }: { fotos: EspacioFoto[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Autoscroll continuo (rAF), mismo patrón que el rooftop: velocidad px/s,
  // lista duplicada, reset a la mitad para loop invisible.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paused = false;
    let raf = 0;
    let last = 0;
    let pos = 0;
    const SPEED = 22; // px/segundo

    const step = (now: number) => {
      if (last === 0) { last = now; pos = track.scrollLeft; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!paused && track.scrollWidth > track.clientWidth) {
        pos += SPEED * dt;
        const mitad = track.scrollWidth / 2;
        if (pos >= mitad) pos -= mitad;
        track.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    track.addEventListener("pointerenter", pause);
    track.addEventListener("pointerleave", resume);
    track.addEventListener("pointerdown", pause);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("pointerenter", pause);
      track.removeEventListener("pointerleave", resume);
      track.removeEventListener("pointerdown", pause);
    };
  }, []);

  if (fotos.length === 0) return null;
  // Duplicamos para el loop invisible.
  const loop = [...fotos, ...fotos];

  return (
    <div
      ref={trackRef}
      className="overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollBehavior: "auto" }}
    >
      {/* Mosaico intercalado: algunas ocupan 2 filas, otras 1. dense rellena huecos. */}
      <div className="grid grid-rows-2 grid-flow-col-dense auto-cols-max gap-3 w-max">
        {loop.map((foto, i) => {
          // Patrón intercalado: 1 de cada 3 ocupa las 2 filas (vertical grande).
          const tall = i % 2 === 0;
          return (
            <figure
              key={`${foto.id}-${i}`}
              className={`relative overflow-hidden group rounded-sm ${tall ? "row-span-2" : "row-span-1"}`}
              style={{
                width: tall ? 230 : 280,
                height: tall ? 392 : 190,   // tall = 2 filas + gap; short = 1 fila
              }}
              aria-hidden={i >= fotos.length ? true : undefined}
            >
              <Image
                src={getOptimizedImageUrl(foto.imagen_url, 500, 600)}
                alt={foto.titulo || "Espacio de Beatmemo"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              {(foto.titulo || foto.epigrafe) && (
                <figcaption className="absolute inset-x-0 bottom-0 p-3 text-white">
                  {foto.titulo && <p className="font-serif font-bold text-sm leading-tight">{foto.titulo}</p>}
                  {foto.epigrafe && <p className="text-white/70 text-[11px]">{foto.epigrafe}</p>}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}