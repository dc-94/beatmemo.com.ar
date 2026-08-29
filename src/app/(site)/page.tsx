// src/app/page.tsx
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

  return (
    <div className="flex flex-col min-h-screen bg-brand-black-100 gap-14 lg:gap-20 pb-32">

      <HeroSection />
      <SellosAccesibilidad variant="strip" />
      <Suspense fallback={<BrandSpinner />}>
        <PromoSection />
      </Suspense>
      <Suspense fallback={<BrandSpinner />}>
        <AgendaWrapper />
      </Suspense>
      <Pub />
      <MuseumPreview />
    </div>
  );
}