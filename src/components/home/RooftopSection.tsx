"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import {  MessageCircle } from "lucide-react";
import { whatsappLink, SOCIAL } from "@/lib/config";

const IMAGES = [
  "/placeholders/rooftop/1.jpeg",
  "/placeholders/rooftop/2.jpeg",
  "/placeholders/rooftop/3.jpeg",
  "/placeholders/rooftop/4.jpeg",
  "/placeholders/rooftop/5.jpeg",
  "/placeholders/rooftop/6.jpeg",
];

const SERVICIOS = ["Cumpleaños", "Eventos corporativos", "Casamientos", "Lanzamientos de marca", "Cenas privadas", "After office"];

export default function RooftopSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Autoplay lento con pausa al interactuar (hover/touch).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paused = false;
    let raf = 0;
    let last = 0;
    let pos = 0;              // ← posición con decimales, acumulada aparte
    const SPEED = 40;         // px/segundo — ahora SÍ podés bajar sin saltos

        const step = (now: number) => {
      if (last === 0) { last = now; pos = track.scrollLeft; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (track.scrollWidth > track.clientWidth) {
        pos += SPEED * dt;
        const mitad = track.scrollWidth / 2;
        if (pos >= mitad) pos -= mitad;
        track.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    track.addEventListener("pointerenter", pause);
    track.addEventListener("pointerleave", resume);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("pointerenter", pause);
      track.removeEventListener("pointerleave", resume);
    };
  }, []);
  return (
    <section className="bg-[#FAF8F4] text-[#111111] py-16 sm:py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header: marca a la izquierda, título a la derecha */}
        <div className="mb-8 lg:mb-10 flex flex-col lg:flex-row items-end lg:justify-between gap-6">
          <div className="lg:text-right lg:max-w-md">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight ">
              Eventos privados.
            </h2>
          </div>
          <div>
            <span className="uppercase tracking-[0.34em] text-[11px] font-bold text-[#111111]/50 block mb-3">Beatmemo</span>
            <Image
              src="/brand/logo_ROOFTOP.svg"
              alt="Beatmemo Rooftop"
              width={250}
              height={84}
              className="h-10 lg:h-16 w-auto"
            />
          </div>
        </div>
        {/* Tira de servicios — sobre el carrusel */}
        <div className="mb-6">
          <ul className="flex flex-wrap gap-2 align-center justify-center lg:justify-start">
            {SERVICIOS.map((s) => (
              <li key={s} className="border border-[#111111]/15 px-3 py-1.5 text-sm font-medium">{s}</li>
            ))}
          </ul>
        </div>
        {/* Carrusel — scroll-snap con peek */}
        <div
          ref={trackRef}
          style={{ scrollBehavior: "auto" }}
          className="flex gap-3 overflow-x-scroll pb-4 mb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[...IMAGES, ...IMAGES].map((src, i) => (
            <div key={i} className="shrink-0 w-[80%] sm:w-[45%] lg:w-[32%] relative aspect-[4/3] overflow-hidden rounded-sm bg-neutral-200">
              <Image src={src} alt={`Beatmemo Rooftop ${(i % IMAGES.length) + 1}`} fill className="object-cover" sizes="(max-width:640px) 80vw, 33vw" />
            </div>
          ))}
        </div>

        {/* CTA — centrados, apilados en móvil */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={whatsappLink("Hola, quiero cotizar un evento en el Rooftop de Beatmemo.")}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white px-7 py-3.5 font-sans font-bold uppercase tracking-[0.14em] text-sm hover:bg-[#333] transition-colors">
            <MessageCircle size={16} /> Cotizá tu evento
          </a>
          {SOCIAL.instagram && (
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#111111]/20 text-[#111111] px-7 py-3.5 font-sans font-bold uppercase tracking-[0.14em] text-sm hover:border-[#111111] transition-colors">
                <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>Instagram
            </a>
          )}
        </div>
      </div>
    </section>
  );
}