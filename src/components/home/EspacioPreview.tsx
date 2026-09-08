// Muestra editorial del espacio en el home: 3 fotos reales + texto corto,
// con link a la galería completa en /pub#espacio.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { EspacioFoto } from "@/lib/pub-data";
import type { SiteContent } from "@/lib/site-content";

export default function EspacioPreview({ contenido, fotos }: { contenido: SiteContent | null; fotos: EspacioFoto[] }) {
  if (fotos.length === 0) return null;
  const tres = fotos.slice(0, 3);

  return (
    <section className="bg-[#F5F1EA] text-[#1A1A1A] py-16 sm:py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Texto */}
          <div>
            <span className="text-[#8A6D2F] uppercase tracking-[0.34em] text-[11px] font-bold block mb-4">
              {contenido?.subtitulo || "El lugar"}
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-5">
              {contenido?.titulo || "Un espacio con historia."}
            </h2>
            <p className="text-[#5C5852] leading-relaxed max-w-md mb-8">
              {contenido?.cuerpo || "Cada rincón de Beatmemo cuenta algo. Recorré el ambiente donde la música, la gastronomía y el legado conviven."}
            </p>
            <Link href="/pub#espacio"
              className="inline-flex items-center gap-2 font-sans font-bold uppercase tracking-[0.16em] text-sm text-[#1A1A1A] border-b-2 border-[#C5A059] pb-1 hover:gap-3 transition-all">
              Conocé el espacio <ArrowRight size={16} />
            </Link>
          </div>

          {/* Fotos — mosaico editorial */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden row-span-2">
              <Image src={getOptimizedImageUrl(tres[0].imagen_url, 600, 800)} alt={tres[0].titulo || "Espacio de Beatmemo"} fill className="object-cover" sizes="(max-width:1024px) 50vw, 25vw" />
            </div>
            {tres[1] && (
              <div className="relative aspect-square overflow-hidden">
                <Image src={getOptimizedImageUrl(tres[1].imagen_url, 500, 500)} alt={tres[1].titulo || "Espacio de Beatmemo"} fill className="object-cover" sizes="(max-width:1024px) 50vw, 25vw" />
              </div>
            )}
            {tres[2] && (
              <div className="relative aspect-square overflow-hidden">
                <Image src={getOptimizedImageUrl(tres[2].imagen_url, 500, 500)} alt={tres[2].titulo || "Espacio de Beatmemo"} fill className="object-cover" sizes="(max-width:1024px) 50vw, 25vw" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}