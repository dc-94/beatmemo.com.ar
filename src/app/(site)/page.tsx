// src/app/(site)/page.tsx
import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import AgendaWrapper from "@/components/home/AgendaWrapper";
import BrandSpinner from "@/components/ui/BrandSpinner";
import PromoSection from "@/components/home/PromoSection";
import SellosAccesibilidad from "@/components/shared/SellosAccesibilidad";
import Pub from "@/components/home/Pub";
import MuseumPreview from "@/components/home/MuseumPreview";
import { SITE_URL } from "@/lib/config";
import { Metadata } from "next";
import { getSiteContent } from "@/lib/site-content";
import { getSiteConfig } from "@/lib/site-config";

export const revalidate = 600;
export const metadata: Metadata = {
  title: "Museo y Pub Temático en Rosario",
  description:
    "El punto de encuentro de los fans de The Beatles en Rosario. Disfrutá de nuestra gastronomía, shows en vivo y el museo temático más importante de la ciudad.",
  openGraph: {
    title: "Beatmemo | Museo y Pub Temático",
    description: "El punto de encuentro de los fans de The Beatles en Rosario.",
    images: ["/og/home.jpg"],
    url: SITE_URL,
  },
};

export default async function HomePage() {
  const [museoContent, config] = await Promise.all([
    getSiteContent("home_museo"),
    getSiteConfig(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-black-100 gap-14 lg:gap-20 pb-32">
      <HeroSection />
      <SellosAccesibilidad variant="strip" />

      {/* Gancho emocional primero */}
      <Suspense fallback={<BrandSpinner />}>
        <AgendaWrapper />
      </Suspense>

      <Pub />

      {/* Promos debajo del pub — provisional hasta el briefing */}
      <Suspense fallback={<BrandSpinner />}>
        <PromoSection />
      </Suspense>
      <MuseumPreview contenido={museoContent} museoVisitas={config.museo_visitas} />
    </div>
  );
}