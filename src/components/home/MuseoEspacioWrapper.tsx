// src/components/home/MuseoEspacioWrapper.tsx
import { publicClient } from "@/lib/supabase/public";
import { getSiteContent } from "@/lib/site-content";
import { getSiteConfig } from "@/lib/site-config";
import MuseoEspacioSection from "./MuseoEspacioSection";

export default async function MuseoEspacioWrapper() {
  const [contenido, config] = await Promise.all([
    getSiteContent("home_museo"),  
    getSiteConfig(),
  ]);

  const { data: fotos } = await publicClient
    .from("espacio_galeria")
    .select("id, imagen_url, titulo, epigrafe, es_museo")
    .eq("is_deleted", false)
    .eq("visible", true)
    .eq("mostrar_home", true)
    .order("orden", { ascending: true }).order("id");

  if (!fotos || fotos.length === 0) return null;

  return (
    <MuseoEspacioSection
      contenido={contenido}
      fotos={fotos}
      museoVisitas={config.museo_visitas}
    />
  );
}