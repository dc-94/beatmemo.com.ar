// Nuestro espacio: galería de fotos del bar con epígrafes.
import EspacioCarrusel from "./EspacioCarrusel";
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

        {/* Galería: scroll horizontal continuo, 2 filas, tamaños variados */}
        <EspacioCarrusel fotos={fotos} />
      </div>
    </section>
  );
}