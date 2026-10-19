// src/app/rooftop/layout.tsx
// Layout propio del Rooftop (fuera de (site): no hereda el chrome ni el schema de Beatmemo)

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { buildRooftopSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Beatmemo Rooftop — Eventos en Rosario",
  description:
    "Un nuevo espacio para tus eventos: casamientos, cumpleaños de 15, corporativos y más, en la terraza de Beatmemo. Cotizá tu evento llave en mano.",
  alternates: { canonical: "/rooftop" },
  openGraph: {
    title: "Beatmemo Rooftop — Eventos en Rosario",
    description:
      "Un nuevo espacio para tus eventos en la terraza de Beatmemo. Servicio llave en mano. Cotizá tu fecha.",
    type: "website",
    url: "/rooftop",
    images: ["/og/home.jpg"],
  },
};

export default function RooftopLayout({ children }: { children: React.ReactNode }) {
  const schema = buildRooftopSchema(SITE_URL);
  return (
    <div className="bg-[#fafafa] text-[#141211] min-h-screen font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </div>
  );
}