// Café y meriendas: 3 platos en tarjetas, foto 16:9 arriba.
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import CTALink from "@/components/shared/CTALink";
import type { PubItem } from "@/lib/pub-data";
import type { SiteContent } from "@/lib/site-content";

export default function FacetaCafe({ contenido, items }: { contenido: SiteContent | null; items: PubItem[] }) {
  if (items.length === 0) return null; // faceta vacía → no se renderiza

  return (
    <section id="cafe" className="py-16 lg:py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-xl mb-10">
          <p className="text-[#C5A059] uppercase tracking-[0.34em] text-[11px] font-bold mb-2">
            {contenido?.subtitulo || "De 9 a 19 hs"}
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#2C2924]">
            {contenido?.titulo || "La mañana larga"}
          </h2>
          {contenido?.cuerpo && <p className="text-[#5C5852] leading-relaxed mt-3">{contenido.cuerpo}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.slice(0, 3).map((item) => (
            <article key={item.id}>
              <div className="relative aspect-[16/9] bg-[#F2EDE5] overflow-hidden mb-3">
                {item.url_imagen && (
                  <Image src={getOptimizedImageUrl(item.url_imagen, 480, 270)} alt={item.nombre} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                )}
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C2924]">{item.nombre}</h3>
              {item.descripcion && <p className="text-[#5C5852] text-sm leading-relaxed mt-1">{item.descripcion}</p>}
            </article>
          ))}
        </div>

        {contenido?.cta_mostrar && contenido.cta_texto && contenido.cta_link && (
          <div className="mt-8"><CTALink href={contenido.cta_link} texto={contenido.cta_texto} /></div>
        )}
      </div>
    </section>
  );
}