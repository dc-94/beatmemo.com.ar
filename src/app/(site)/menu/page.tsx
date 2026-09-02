// src/app/menu/page.tsx
// Entrada WEB del visor de cartas. La lógica vive en MenuView.
import { Metadata } from "next";
import MenuView from "@/components/menu/MenuView";

export const metadata: Metadata = {
  title: "Carta Digital",
  description: "Nuestras cartas: cocina, barra, happy hour y whisky collection.",
  openGraph:{
  images: ["/og/pub.jpg"],
  }
};

// Sin `revalidate`: searchParams fuerza render dinámico igual, y declarar
// un cache que no existe es peor que no declararlo.

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  return <MenuView tipo={tipo} isQr={false} />;
}