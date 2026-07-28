// src/app/page.tsx
import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import AgendaWrapper from "@/components/home/AgendaWrapper";
import BrandSpinner from "@/components/ui/BrandSpinner";
import PromoSection from "@/components/home/PromoSection";
import SellosAccesibilidad from "@/components/shared/SellosAccesibilidad";
import Pub from "@/components/home/Pub";
import MuseumPreview from "@/components/home/MuseumPreview";
import { CONTACT, SITE_URL } from "@/lib/config";

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "Museum"],
    name: "Beatmemo",
    image: `${SITE_URL}/og/home.jpg`,
    "@id": SITE_URL,
    url: SITE_URL,
    telephone: CONTACT.phoneIntl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bv. Oroño 107 bis",
      addressLocality: "Rosario",
      addressRegion: "Santa Fe",
      postalCode: "S2000",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -32.935105,
      longitude: -60.655938,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "8:30",
        closes: "01:00",
      },
    ],
    // Ahora apunta al visor real de cartas, no a la landing editorial.
    menu: `${SITE_URL}/menu`,
    servesCuisine: "Gastronomía de Autor, Coctelería",
    priceRange: "$$",
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black-100 gap-14 lg:gap-20 pb-32">
      {/* JSON-LD: estaba definido y NUNCA se emitía al DOM.
          Sin este script, todo el schema de SEO local era código muerto. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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