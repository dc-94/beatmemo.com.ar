// Happy hour: foto en paralelo al texto, horario gigante, sellos de cobertura.
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { SiteContent } from "@/lib/site-content";

// Qué entra en el happy hour. Fijo (sale de la carta), no editable por ahora.
const COBERTURA = ["Cerveza tirada", "Copa de vino", "Aperitivos", "Gin", "Clásicos", "De autor", "Whisky"];

export default function FacetaHappyHour({ contenido }: { contenido: SiteContent | null }) {
  return (
    <section id="happyhour" className="py-16 lg:py-24 bg-[#0C0C0C] text-white scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Foto en paralelo al contenedor de texto */}
        <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
          {contenido?.imagen_url ? (
            <Image src={getOptimizedImageUrl(contenido.imagen_url, 640, 480)} alt={contenido.alt_texto || "Barra en happy hour"} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">Sin foto</div>
          )}
        </div>

        <div>
          <p className="text-[#E6C987] uppercase tracking-[0.34em] text-[11px] font-bold mb-3">
            {contenido?.subtitulo || "Todos los días · 18:30 a 21"}
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#E6C987] leading-none mb-5">
            {contenido?.titulo || "Casi toda la barra, más barata"}
          </h2>
          {contenido?.cuerpo && <p className="text-white/60 leading-relaxed mb-6 max-w-md">{contenido.cuerpo}</p>}

          <div className="flex flex-wrap gap-2">
            {COBERTURA.map((c) => (
              <span key={c} className="text-[11px] uppercase tracking-[0.12em] font-semibold border border-[#C5A059] text-[#C5A059] px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}