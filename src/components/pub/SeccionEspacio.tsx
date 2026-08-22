// Nuestro espacio: galería de fotos del bar con epígrafes.
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { EspacioFoto } from "@/lib/pub-data";
import type { SiteContent } from "@/lib/site-content";

export default function SeccionEspacio({ contenido, fotos }: { contenido: SiteContent | null; fotos: EspacioFoto[] }) {
  if (fotos.length === 0) return null;

  return (
    <section id="espacio" className="py-16 lg:py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-[#C5A059] uppercase tracking-[0.34em] text-[11px] font-bold mb-2">
            {contenido?.subtitulo || "El lugar"}
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#2C2924]">
            {contenido?.titulo || "Nuestro espacio"}
          </h2>
          {contenido?.cuerpo && <p className="text-[#5C5852] max-w-xl mx-auto mt-3">{contenido.cuerpo}</p>}
        </div>

        {/* Grilla tipo galería. La primera foto ocupa doble ancho si hay 3+. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {fotos.map((foto, i) => (
            <figure key={foto.id} className={`relative overflow-hidden group ${i === 0 && fotos.length >= 3 ? "col-span-2 lg:col-span-2 aspect-[16/9]" : "aspect-square"}`}>
              <Image src={getOptimizedImageUrl(foto.imagen_url, 600, 600)} alt={foto.titulo || "Espacio de Beatmemo"} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:1024px) 50vw, 33vw" />
              {(foto.titulo || foto.epigrafe) && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                  {foto.titulo && <p className="font-serif font-bold">{foto.titulo}</p>}
                  {foto.epigrafe && <p className="text-white/70 text-xs">{foto.epigrafe}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}