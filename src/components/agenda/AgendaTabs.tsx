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

  const tabs = [
    { key: "past", label: "Anteriores", href: "/agenda?view=past", visible: true },
    { key: "current", label: "Este mes", href: "/agenda?view=current", visible: true },
    {
      key: "next",
      label: nextMonthName,
      href: `/agenda?view=next&mes=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`,
      visible: hayProximos,
    },
  ];

  return (
    <nav className="max-w-7xl mx-auto px-4 py-8 lg:py-10 w-full">
      <div className="grid  grid-cols-3 items-end gap-2 border-b border-[#C5A059]/30 pb-3">
        {tabs.map((t) => {
          const activo = view === t.key;
          if (!t.visible) return <span key={t.key} aria-hidden="true" />;

          return (
            <Link
              key={t.key}
              href={t.href}
              scroll={false}
              aria-current={activo ? "page" : undefined}
              className={`text-center font-serif font-bold capitalize leading-none truncate transition-all duration-300 ${
                activo
                  ? "text-xl sm:text-3xl lg:text-4xl text-brand-white-100"
                  : "text-sm sm:text-base text-brand-white-300 hover:text-[#C5A059] pb-1"
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