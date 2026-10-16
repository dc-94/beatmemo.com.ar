// src/app/rooftop/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beatmemo Rooftop — Eventos en Rosario",
  description:
    "Un nuevo espacio para tus eventos: casamientos, cumpleaños de 15, corporativos y más, en la terraza de Beatmemo. Cotizá tu evento llave en mano.",
  openGraph: {
    title: "Beatmemo Rooftop — Eventos en Rosario",
    description:
      "Un nuevo espacio para tus eventos en la terraza de Beatmemo. Servicio llave en mano. Cotizá tu fecha.",
    type: "website",
  },
};

export default function RooftopLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-white text-[#141211] min-h-screen font-sans">{children}</div>;
}
 