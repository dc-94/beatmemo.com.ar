// src/app/qr/page.tsx
// Entrada QR del visor. El middleware reescribe qr.beatmemo.com.ar/ → /qr.
// Misma implementación que /menu, distinto contexto de presentación.
import { Metadata } from "next";
import MenuView from "@/components/menu/MenuView";

export const metadata: Metadata = {
  title: "Carta Digital",
  // Cinturón + tiradores con el X-Robots-Tag del middleware: esta ruta sirve
  // el MISMO contenido que /menu. Sin noindex sería contenido duplicado.
  robots: { index: false, follow: false },
};

export default async function QrPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  return <MenuView tipo={tipo} isQr={true} />;
}