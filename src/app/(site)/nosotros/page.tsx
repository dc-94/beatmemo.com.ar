// src/app/(site)/nosotros/page.tsx
import Image from "next/image";
import { getCulturalEvents } from "@/lib/shows-data";
import { getSiteConfig } from "@/lib/site-config";
import CulturalGrid from "@/components/eventos/CulturalGrid";
import type { Metadata } from "next";
import SellosAccesibilidad from "@/components/shared/SellosAccesibilidad";
export const metadata: Metadata = {
  title: "Nosotros",
  description: "Beatmemo es un núcleo de intercambio cultural en Rosario, declarado sitio de interés. Gastronomía, idiomas y el amor por The Beatles.",
  openGraph: {
    title: "Nosotros | Beatmemo",
    description: "Un núcleo cultural declarado sitio de interés en Rosario.",
    images: ["/og/nosotros.jpg"],
  },
};

export default async function NosotrosPage() {
  const [result, config] = await Promise.all([getCulturalEvents(), getSiteConfig()]);
  const eventos = result.ok ? result.data : [];

  return (
    <main className="min-h-screen bg-[#F5F4F0] text-brand-black-100 font-sans pb-32">
      {/* HERO — igual que ahora */}
      <section className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image src="/placeholders/hero/fachada.jpeg" alt="Fachada Cultural Beatmemo" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black-100/90 via-brand-black-100/60 to-[#F5F4F0]" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 max-w-7xl mx-auto">
          <span className="text-[#f1f1f1] uppercase tracking-[0.4em] text-[14px] font-bold mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            Comunidad y Encuentro
          </span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight text-[#fafafa] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            Cultura Viva.
          </h1>
        </div>
      </section>
      <SellosAccesibilidad variant="strip" surface="light" />
      {/* INTRO EDITORIAL — igual */}
      <section className="py-16 px-4 max-w-3xl mx-auto text-center lg:text-left">
        <p className="text-lg lg:text-xl text-gray-700 leading-relaxed font-light">
          Más allá de la música, Beatmemo es un núcleo de intercambio cultural en Rosario. Declarado sitio de interés por la Municipalidad, abrimos nuestras puertas semanalmente para fusionar gastronomía, idiomas y el amor por el formato físico. Sumate a nuestras mesas.
        </p>
      </section>

      {/* EVENTOS CULTURALES — ahora con EventoCard superficie light */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-[#C5A059] uppercase tracking-[0.3em] text-[14px] font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6C987] animate-pulse" />
            Agenda Abierta
          </span>
          <h2 className="font-serif font-bold text-4xl lg:text-5xl text-brand-black-100 tracking-tight">
            Próximos eventos culturales
          </h2>
        </div>

        <CulturalGrid eventos={eventos} whatsappNumero={config.whatsapp_numero} />
      </section>
    </main>
  );
}