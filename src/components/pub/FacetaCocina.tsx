// La cocina: mosaico asimétrico + texto a la derecha (Z) + fila de variedades 1:1.
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import CTALink from "@/components/shared/CTALink";
import type { PubItem } from "@/lib/pub-data";
import type { SiteContent } from "@/lib/site-content";

export default function FacetaCocina({
  contenido, contenidoVariedad, items, variedades,
}: {
  contenido: SiteContent | null;
  contenidoVariedad: SiteContent | null;
  items: PubItem[];
  variedades: PubItem[];
}) {
  if (items.length === 0 && variedades.length === 0) return null;
  const mosaico = items.slice(0, 3);

  return (
    <section id="cocina" className="py-16 lg:py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Texto a la derecha (patrón Z) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-8">
          <div />
          <div className="lg:text-right">
            <p className="text-[#C5A059] uppercase tracking-[0.34em] text-[11px] font-bold mb-2">
              {contenido?.subtitulo || "Mediodía y noche"}
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#2C2924]">
              {contenido?.titulo || "La cocina"}
            </h2>
            {contenido?.cuerpo && <p className="text-[#5C5852] leading-relaxed mt-3 lg:ml-auto max-w-md">{contenido.cuerpo}</p>}
          </div>
        </div>

        {/* Mosaico asimétrico */}
        {mosaico.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:row-span-2 bg-[#F2EDE5] overflow-hidden">
              {mosaico[0]?.url_imagen && (
                <Image src={getOptimizedImageUrl(mosaico[0].url_imagen, 700, 525)} alt={mosaico[0].nombre} fill className="object-cover" sizes="(max-width:1024px) 100vw, 60vw" />
              )}
            </div>
            {mosaico.slice(1, 3).map((item) => (
              <div key={item.id} className="relative aspect-[16/9] bg-[#F2EDE5] overflow-hidden">
                {item.url_imagen && (
                  <Image src={getOptimizedImageUrl(item.url_imagen, 400, 225)} alt={item.nombre} fill className="object-cover" sizes="40vw" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fila de variedades 1:1 con divisor central */}
        {variedades.length > 0 && (
          <>
            <p className="text-center uppercase tracking-[0.28em] text-[13px] font-bold text-[#C5A059] my-10 relative">
              <span className="bg-[#FAF7F2] px-4 relative z-10">{contenidoVariedad?.titulo || "Elegí tu variedad"}</span>
              <span className="absolute left-0 right-0 top-1/2 h-px bg-[#D1CCC0] -z-0" />
            </p>
            <div className="grid grid-cols-3 gap-4">
              {variedades.slice(0, 3).map((v) => (
                <article key={v.id} className="text-center">
                  <div className="relative aspect-square bg-[#F2EDE5] overflow-hidden mb-2">
                    {v.url_imagen && (
                      <Image src={getOptimizedImageUrl(v.url_imagen, 300, 300)} alt={v.nombre} fill className="object-cover" sizes="33vw" />
                    )}
                  </div>
                  <h4 className="font-serif text-sm lg:text-base font-bold text-[#2C2924]">{v.nombre}</h4>
                </article>
              ))}
            </div>
          </>
        )}

        {contenido?.cta_mostrar && contenido.cta_texto && contenido.cta_link && (
          <div className="mt-8 lg:text-right"><CTALink href={contenido.cta_link} texto={contenido.cta_texto} /></div>
        )}
      </div>
    </section>
  );
}