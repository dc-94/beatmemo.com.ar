// Subnav pegajosa de /pub. Client: scroll suave a los anclas y resaltado
// de la sección activa según el scroll.
"use client";

import { useEffect, useState } from "react";

export default function PubSubnav({ secciones }: { secciones: { id: string; label: string }[] }) {
  const [activa, setActiva] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiva(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" } // activa cuando la sección está cerca del centro
    );
    secciones.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [secciones]);

  if (secciones.length === 0) return null;

  return (
    <nav className="sticky top-20 z-30 bg-[#FAF7F2]/90 backdrop-blur border-y border-[#D1CCC0]/50">
      <div className="max-w-6xl mx-auto px-4 flex gap-6 justify-center flex-wrap py-3 overflow-x-auto">
        {secciones.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`text-[11px] uppercase tracking-[0.2em] whitespace-nowrap font-bold transition-colors ${
              activa === s.id ? "text-[#C5A059] font-black" : "text-[#5C5852] hover:text-[#2C2924]"
            }`}
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}