// src/components/agenda/AgendaTabs.tsx
"use client";

import Link from "next/link";

interface Props {
  view: string;
  nextMonth: Date;
  hayProximos: boolean;
}

export default function AgendaTabs({ view, nextMonth, hayProximos }: Props) {
  const nextMonthName = nextMonth.toLocaleString("es-AR", { month: "long" });

  // Tres posiciones FIJAS. "next" siempre ocupa su lugar aunque esté oculto
  // (se renderiza invisible para mantener la grilla de 3).
  const tabs = [
    { key: "past", label: "Anteriores", href: "/agenda?view=past", visible: true },
    { key: "current", label: "Este mes", href: "/agenda?view=current", visible: true },
    { key: "next", label: nextMonthName, href: `/agenda?view=next&mes=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`, visible: hayProximos },
  ];

  return (
    <nav className="max-w-7xl mx-auto px-4 py-10 w-full">
      <div className="grid grid-cols-3 items-end border-b border-[#C5A059]/30 pb-3">
        {tabs.map((t) => {
          const activo = view === t.key;

          // El tab oculto (next sin eventos) ocupa su lugar pero invisible.
          if (!t.visible) return <span key={t.key} aria-hidden="true" />;

          return (
            <Link
              key={t.key}
              href={t.href}
              className={`text-center font-serif font-bold capitalize transition-all duration-300  ${
                activo
                  ? "text-3xl lg:text-4xl text-brand-white-100 leading-none "          // activa = título grande
                  : "text-md lg:text-base text-brand-white-300 hover:text-[#C5A059] leading-none pb-1"  // inactivas chicas
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}