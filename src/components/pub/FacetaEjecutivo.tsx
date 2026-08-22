// Menú ejecutivo: banda oscura, la cadena "incluye" es protagonista.
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import CTALink from "@/components/shared/CTALink";
import type { PubItem } from "@/lib/pub-data";
import type { SiteContent } from "@/lib/site-content";

const INCLUYE = ["Entrada", "Principal", "Bebida", "Postre o café"];

export default function FacetaEjecutivo({ contenido, items }: { contenido: SiteContent | null; items: PubItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="ejecutivo" className="py-16 lg:py-24 bg-[#0C0C0C] text-white scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-[#E6C987] uppercase tracking-[0.34em] text-[11px] font-bold mb-2">
          {contenido?.subtitulo || "Lunes a viernes · 12 a 15:30"}
        </p>
        <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
          {contenido?.titulo || "Sugerencias de mediodía"}
        </h2>
        {contenido?.cuerpo && <p className="text-white/60 max-w-lg mx-auto mb-8">{contenido.cuerpo}</p>}

        <div className="flex gap-2 justify-center flex-wrap uppercase tracking-[0.16em] text-sm text-[#E6C987] mb-12 font-sans" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          {INCLUYE.map((paso, i) => (
            <span key={paso} className="flex items-center gap-2">
              {paso}{i < INCLUYE.length - 1 && <span className="opacity-40">+</span>}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {items.slice(0, 3).map((item) => (
            <article key={item.id}>
              <div className="relative aspect-[16/9] bg-white/5 overflow-hidden mb-3">
                {item.url_imagen && (
                  <Image src={getOptimizedImageUrl(item.url_imagen, 480, 270)} alt={item.nombre} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                )}
              </div>
              <h3 className="font-serif text-lg font-bold">{item.nombre}</h3>
              {item.descripcion && <p className="text-white/50 text-sm mt-1">{item.descripcion}</p>}
            </article>
          ))}
        </div>

        {contenido?.cta_mostrar && contenido.cta_texto && contenido.cta_link && (
          <div className="mt-10"><CTALink href={contenido.cta_link} texto={contenido.cta_texto} /></div>
        )}
      </div>
    </section>
  );
}