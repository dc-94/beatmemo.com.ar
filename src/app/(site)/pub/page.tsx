// src/app/(site)/pub/page.tsx
import Image from "next/image";
import { Metadata } from "next";
import { getSiteContent } from "@/lib/site-content";
import { getPubFacetas, getWhiskies, getEspacioFotos } from "@/lib/pub-data";
import { getOptimizedImageUrl } from "@/lib/utils";
import CTALink from "@/components/shared/CTALink";

import PubSubnav from "@/components/pub/PubSubnav";
import FacetaCafe from "@/components/pub/FacetaCafe";
import FacetaEjecutivo from "@/components/pub/FacetaEjecutivo";
import FacetaCocina from "@/components/pub/FacetaCocina";
import SellosCocina from "@/components/pub/SellosCocina";
import FacetaHappyHour from "@/components/pub/FacetaHappyHour";
import FacetaBarra from "@/components/pub/FacetaBarra";
import CarruselWhisky from "@/components/pub/CarruselWhisky";
import SeccionEspacio from "@/components/pub/SeccionEspacio";
import CierreCTA from "@/components/pub/CierreCTA";

export const metadata: Metadata = {
  title: "Pub y Gastronomía",
  description: "Café, cocina, happy hour, tragos de autor y una colección de whisky en un ambiente temático único.",
  openGraph: {
    title: "Pub y Gastronomía | Beatmemo",
    description: "Gastronomía de autor y los mejores cócteles en un ambiente temático único.",
    images: ["/og/pub.jpg"],
  },
};

export const revalidate = 300;

export default async function PubPage() {
  // Todas las lecturas en paralelo. publicClient → cacheable por ISR.
  const [
    hero, cCafe, cEjecutivo, cCocina, cVariedades, cSello1, cSello2, cHH, cBarra, cWhisky, cEspacio,
    facetas, whiskies, espacioFotos,
  ] = await Promise.all([
    getSiteContent("pub"),
    getSiteContent("pub_cafe"),
    getSiteContent("pub_ejecutivo"),
    getSiteContent("pub_cocina"),
    getSiteContent("pub_variedades"),
    getSiteContent("pub_sello_1"),
    getSiteContent("pub_sello_2"),
    getSiteContent("pub_hh"),
    getSiteContent("pub_barra"),
    getSiteContent("pub_whisky"),
    getSiteContent("pub_espacio"),
    getPubFacetas(),
    getWhiskies(),
    getEspacioFotos(),
  ]);

  // Qué secciones existen, para armar la subnav dinámicamente (solo las que tienen contenido).
  const secciones = [
    espacioFotos.length > 0 && { id: "espacio", label: "El espacio" },
    (facetas.cafe?.length ?? 0) > 0 && { id: "cafe", label: "Café" },
    (facetas.ejecutivo?.length ?? 0) > 0 && { id: "ejecutivo", label: "Mediodía" },
    (facetas.cocina?.length ?? 0) > 0 && { id: "cocina", label: "Cocina" },
    { id: "happyhour", label: "Happy hour" },
    (facetas.barra_autor?.length ?? 0) > 0 && { id: "barra", label: "Barra" },
    whiskies.length > 0 && { id: "whisky", label: "Whisky" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C2924] scroll-smooth">
      {/* HERO — conservado, editable desde site_content. Sin id (espacio es la galería). */}
      <section className="relative h-[70vh] w-full">
        {hero?.imagen_url ? (
          <Image src={getOptimizedImageUrl(hero.imagen_url, 1920, 1080)} alt={hero.alt_texto || "Ambiente del pub Beatmemo"} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-[#141414]" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-16 left-4 lg:left-16 right-4 lg:right-16 text-white">
          <span className="text-[#E6C987] uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">
            {hero?.subtitulo || "Gastronomía & Barra"}
          </span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold mb-6">{hero?.titulo || "Classic Pub."}</h1>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {hero?.cuerpo && <p className="text-white/80 text-sm lg:text-base leading-relaxed max-w-xl">{hero.cuerpo}</p>}
            {hero?.cta_mostrar && hero.cta_texto && hero.cta_link && (
              <div className="shrink-0"><CTALink href={hero.cta_link} texto={hero.cta_texto} /></div>
            )}
          </div>
        </div>
      </section>

      <PubSubnav secciones={secciones} />

      {/* El orden narra un día: mañana → noche */}
      <SeccionEspacio contenido={cEspacio} fotos={espacioFotos} />
      <FacetaCafe contenido={cCafe} items={facetas.cafe ?? []} />
      <FacetaEjecutivo contenido={cEjecutivo} items={facetas.ejecutivo ?? []} />
      <FacetaCocina contenido={cCocina} contenidoVariedad={cVariedades} items={facetas.cocina ?? []} variedades={facetas.variedad ?? []} />
      <SellosCocina sello1={cSello1} sello2={cSello2} />
      <FacetaHappyHour contenido={cHH} />

      {/* Barra de autor + whisky viven en la misma banda oscura, whisky cierra */}
      <FacetaBarra contenido={cBarra} items={facetas.barra_autor ?? []} />
      <section id="whisky" className="py-16 lg:py-24 bg-[#080808] text-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 text-center mb-10">
          <p className="text-[#E6C987] uppercase tracking-[0.34em] text-[11px] font-bold mb-2">{cWhisky?.subtitulo || "La colección"}</p>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-3">{cWhisky?.titulo || "The Whisky Collection"}</h2>
          {cWhisky?.cuerpo && <p className="text-white/60 max-w-xl mx-auto">{cWhisky.cuerpo}</p>}
        </div>
        <CarruselWhisky whiskies={whiskies} />
      </section>

      <CierreCTA />
    </main>
  );
}