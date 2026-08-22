// Carrusel automático de logos de whisky. Client: anima solo en loop.
// Respeta prefers-reduced-motion (WCAG): si el usuario pidió menos animación,
// se vuelve una grilla estática scrolleable a mano.
"use client";

import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { Whisky } from "@/lib/pub-data";

const COL_LABEL: Record<string, string> = {
  blended: "Blended", blended_malts: "Malts", irish: "Irish",
  single_malt: "Single Malt", bourbon: "Bourbon",
};

export default function CarruselWhisky({ whiskies }: { whiskies: Whisky[] }) {
  if (whiskies.length === 0) return null;

  // Duplicamos la lista para que el loop sea continuo (sin salto al reiniciar).
  const loop = [...whiskies, ...whiskies];

  return (
    <div className="w-full overflow-hidden" aria-label="Colección de whiskies">
      <div className="flex gap-10 w-max animate-whisky-scroll motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {loop.map((w, i) => (
          <div key={`${w.id}-${i}`} className="flex-none w-[150px] text-center relative" aria-hidden={i >= whiskies.length ? true : undefined}>
            {w.tiene_hh && (
              <span className="absolute -top-1 right-0 z-10 text-[9px] uppercase font-bold text-[#E6C987] border border-[#E6C987]/50 rounded-full px-1.5 py-0.5 bg-black/60">HH</span>
            )}
            <div className="h-14 flex items-center justify-center mb-2">
              {w.logo_url ? (
                <Image src={getOptimizedImageUrl(w.logo_url, 150, 56)} alt={w.marca} width={120} height={48} className="object-contain max-h-12 w-auto opacity-90" />
              ) : (
                <span className="font-serif text-lg text-white/70">{w.marca}</span>
              )}
            </div>
            <p className="text-white text-sm font-medium">{w.marca}</p>
            {w.expresion && <p className="text-white/45 text-xs uppercase tracking-wide" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{w.expresion}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}