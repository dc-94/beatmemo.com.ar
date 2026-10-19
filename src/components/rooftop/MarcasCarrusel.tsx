// src/components/rooftop/MarcasCarrusel.tsx  (Server Component)

import { ROOFTOP_MARCAS } from "@/lib/rooftop-data";

export default function MarcasCarrusel() {
  if (ROOFTOP_MARCAS.length === 0) return null;
  const items = [...ROOFTOP_MARCAS, ...ROOFTOP_MARCAS]; // duplicado para loop sin corte

  return (
    <div className="mt-14">
      <style>{`
        @keyframes rtMarcas{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .rt-marcas{display:flex;width:max-content;align-items:center;gap:3rem;animation:rtMarcas 32s linear infinite}
        .rt-marcas-wrap:hover .rt-marcas{animation-play-state:paused}
        @media(prefers-reduced-motion:reduce){.rt-marcas{animation:none;flex-wrap:wrap;justify-content:center;width:100%}}
      `}</style>
      <p className="text-[0.68rem] tracking-[0.26em] uppercase text-[#b4ac9c] font-bold mb-5">Ya trabajaron con nosotros</p>
      <div
        className="rt-marcas-wrap overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
          maskImage: "linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)",
        }}
      >
        <div className="rt-marcas">
          {items.map((m, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={m.logo} alt={m.nombre} className="h-9 w-auto object-contain grayscale opacity-60 hover:opacity-100 transition shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}