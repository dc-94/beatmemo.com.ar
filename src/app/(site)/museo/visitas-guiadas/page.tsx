// src/app/(site)/museo/visitas-guiadas/page.tsx
import { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";
import VisitasGuiadasView from "@/components/museo/VisitasGuiadasView";

export const metadata: Metadata = {
  title: "Visitas Guiadas",
  description:
    "Visitas guiadas al museo Beatmemo: free tour dominical y recorridos para instituciones educativas en español e inglés.",
};

export const revalidate = 300;

export default async function VisitasGuiadasPage() {
  const config = await getSiteConfig();
  return <VisitasGuiadasView escuelas={config.museo_visitas.escuelas} />;
}