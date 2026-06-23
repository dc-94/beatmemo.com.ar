// src/app/page.tsx
import HeroSection from "@/components/home/HeroSection";
import Banner from "@/components/home/Banner";
import AgendaPreview from "@/components/home/AgendaPreview";
import Pub from "@/components/home/Pub";
import MuseumPreview from "@/components/home/MuseumPreview";
import { getUpcomingShows } from "@/actions/shows";

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Museo y Pub Temático en Rosario', // Se verá: "Museo y Pub Temático en Rosario | Beatmemo"
  description: 'El punto de encuentro de los fans de The Beatles en Rosario. Disfrutá de nuestra gastronomía, shows en vivo y el museo temático más importante de la ciudad.',
  openGraph: {
    title: 'Beatmemo | Museo y Pub Temático',
    description: 'El punto de encuentro de los fans de The Beatles en Rosario.',
    images: ['/og/home.jpg'], // Asegúrate de tener esta imagen en public/og/
    url: 'https://beatmemo.com.ar', // Cambia por tu dominio real
  },
};


export default async function HomePage() {
  const shows = await getUpcomingShows();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "Museum"],
    "name": "Beatmemo",
    "image": "https://beatmemo.com.ar/og/home.jpg", // Tu imagen principal
    "@id": "https://beatmemo.com.ar",
    "url": "https://beatmemo.com.ar",
    "telephone": "+5493412023737", // El número de reservas que ya usamos
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bv. Oroño 107 bis", // Corrobora si es tu dirección exacta
      "addressLocality": "Rosario",
      "addressRegion": "Santa Fe",
      "postalCode": "S2000",
      "addressCountry": "AR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -32.935105, // Coordenadas aproximadas de Oroño y Güemes
      "longitude": -60.655938
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "8:30",
        "closes": "01:00"
      }
    ],
    "menu": "https://beatmemo.com.ar/pub",
    "servesCuisine": "Gastronomía de Autor, Coctelería",
    "priceRange": "$$"
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-black-100 gap-14 lg:gap-20 pb-32">
      <HeroSection />
      <Banner />
      <AgendaPreview shows={shows} />
      <Pub />
      <MuseumPreview />
    </div>
  );
}