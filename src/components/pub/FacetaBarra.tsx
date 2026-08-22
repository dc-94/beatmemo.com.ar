// Barra de autor: el bloque estrella. Foto + nombre de canción + ingredientes en lista.
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import CTALink from "@/components/shared/CTALink";
import type { PubItem } from "@/lib/pub-data";
import type { SiteContent } from "@/lib/site-content";
import AtributoBadges from "@/components/pub/AtributoBadges";

export default function FacetaBarra({ contenido, items }: { contenido: SiteContent | null; items: PubItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="barra" className="py-16 lg:py-24 bg-[#0C0C0C] text-white border-t border-white/10 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[#E6C987] uppercase tracking-[0.34em] text-[11px] font-bold mb-2">
            {contenido?.subtitulo || "Creaciones de barra"}
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-3">
            {contenido?.titulo || "Tragos con nombre de canción"}
          </h2>
          {contenido?.cuerpo && <p className="text-white/60 max-w-xl mx-auto">{contenido.cuerpo}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.slice(0, 6).map((trago) => (
            <article key={trago.id} className="border border-white/10">
              <div className="relative aspect-[4/3] bg-white/5 overflow-hidden border-b border-white/10">
                {trago.url_imagen && (
                  <Image src={getOptimizedImageUrl(trago.url_imagen, 400, 300)} alt={trago.nombre} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
                )}
              </div>
              {/* El nombre de la canción es el protagonista, más grande que los ingredientes */}
              <h3 className="font-serif italic text-xl text-[#E6C987] px-5 pt-4 pb-2">{trago.nombre}</h3>
              {trago.ingredientes && trago.ingredientes.length > 0 && (
                <ul className="px-5 pb-2">
                  {trago.ingredientes.map((ing, i) => (
                    <li key={i} className="text-sm text-white/60 py-1 border-b border-white/5 pl-3 relative">
                      <span className="absolute left-0 text-[#C5A059]">·</span>{ing}
                    </li>
                  ))}
                </ul>
              )}

              <div className="px-5 pb-5">
                <AtributoBadges item={trago} max={3} variant="dark" />
              </div>
            </article>
          ))}
        </div>

        {contenido?.cta_mostrar && contenido.cta_texto && contenido.cta_link && (
          <div className="text-center mt-10"><CTALink href={contenido.cta_link} texto={contenido.cta_texto} /></div>
        )}
      </div>
    </section>
  );
}