"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import {  MessageCircle } from "lucide-react";
import { whatsappLink, SOCIAL } from "@/lib/config";

const IMAGES = [
  "/placeholders/rooftop/1.jpg",
  "/placeholders/rooftop/2.jpg",
  "/placeholders/rooftop/3.jpg",
  "/placeholders/rooftop/4.jpg",
];

const SERVICIOS = ["Cumpleaños", "Eventos corporativos", "Casamientos", "Lanzamientos de marca", "Cenas privadas", "After office"];

export default function RooftopSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Autoplay lento con pausa al interactuar (hover/touch).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    track.addEventListener("pointerdown", pause);
    track.addEventListener("pointerup", resume);
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    const id = setInterval(() => {
      if (paused || !track) return;
      const cardW = track.firstElementChild?.clientWidth ?? 300;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + cardW + 12, behavior: "smooth" });
    }, 3500);

    return () => {
      clearInterval(id);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("pointerup", resume);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <section className="bg-[#FAF8F4] text-[#111111] py-16 sm:py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4">
        {/* Encabezado — jerarquía por peso, todo negro */}
        <div className="mb-10 lg:mb-14 max-w-2xl">
          <span className="uppercase tracking-[0.34em] text-[11px] font-bold text-[#111111]/50 block mb-4">Beatmemo Rooftop</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-6xl leading-[1.05] tracking-tight mb-5">
            Tu evento, en las alturas.
          </h2>
          <p className="text-[#111111]/60 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Un espacio único para celebraciones privadas y eventos de marca, con la impronta Beatmemo.
          </p>
        </div>

        {/* Carrusel — scroll-snap con peek */}
        <div ref={trackRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 mb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {IMAGES.map((src, i) => (
            <div key={i} className="snap-start shrink-0 w-[80%] sm:w-[45%] lg:w-[32%] relative aspect-[4/3] overflow-hidden rounded-sm bg-neutral-200">
              <Image src={src} alt={`Beatmemo Rooftop ${i + 1}`} fill className="object-cover" sizes="(max-width:640px) 80vw, 33vw" />
            </div>
          ))}
        </div>

        {/* Servicios + CTA */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <p className="uppercase tracking-[0.2em] text-[11px] font-bold text-[#111111]/50 mb-4">Ideal para</p>
            <ul className="flex flex-wrap gap-2">
              {SERVICIOS.map((s) => (
                <li key={s} className="border border-[#111111]/15 px-3 py-1.5 text-sm font-medium">{s}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={whatsappLink("Hola, quiero cotizar un evento en el Rooftop de Beatmemo.")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white px-7 py-3.5 font-sans font-bold uppercase tracking-[0.14em] text-sm hover:bg-[#333] transition-colors">
              <MessageCircle size={16} /> Cotizá tu evento
            </a>
            {SOCIAL.instagram && (
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-[#111111]/20 text-[#111111] px-7 py-3.5 font-sans font-bold uppercase tracking-[0.14em] text-sm hover:border-[#111111] transition-colors">
Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}