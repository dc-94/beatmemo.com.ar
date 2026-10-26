// src/lib/rooftop-hero.ts — lectura pública (publicClient → ISR) + fallback resiliente.
import { publicClient } from "@/lib/supabase/public";

export interface HeroData {
  subtitulo: string; titulo: string; cuerpo: string;
  cta_label: string; cta_url: string; imagenes: string[];
}

// Fallback de textos = contenido real (no placeholder). Imágenes vacías → hero sobre fondo oscuro.
const FALLBACK: HeroData = {
  subtitulo: "", titulo: "Un nuevo espacio para tus eventos.", cuerpo: "",
  cta_label: "Cotizá tu evento", cta_url: "#cotizar", imagenes: [],
};

export async function getHeroPublico(): Promise<HeroData> {
  try {
    const { data, error } = await publicClient
      .from("rooftop_secciones")
      .select("titulo, subtitulo, cuerpo, cta_label, cta_url, imagenes")
      .eq("clave", "hero").maybeSingle();

    if (error || !data) return FALLBACK;

    return {
      subtitulo: data.subtitulo ?? "",
      titulo: data.titulo || FALLBACK.titulo,
      cuerpo: data.cuerpo ?? "",
      cta_label: data.cta_label || FALLBACK.cta_label,
      cta_url: data.cta_url || FALLBACK.cta_url,
      imagenes: Array.isArray(data.imagenes) ? (data.imagenes as string[]) : [],
    };
  } catch {
    return FALLBACK;
  }
}