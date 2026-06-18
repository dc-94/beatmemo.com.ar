// src/app/page.tsx
import HeroSection from "@/components/home/HeroSection";
import Banner from "@/components/home/Banner";
import AgendaPreview from "@/components/home/AgendaPreview";
import Pub from "@/components/home/Pub";
import MuseumPreview from "@/components/home/MuseumPreview";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-black-100 gap-14 lg:gap-20 pb-32">
      <HeroSection />
      <Banner />
      <AgendaPreview />
      <Pub />
      <MuseumPreview />
    </div>
  );
}