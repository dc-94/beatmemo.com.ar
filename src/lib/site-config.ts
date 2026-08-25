// src/lib/site-config.ts
// Lee la config del negocio. publicClient (sin cookies) → no rompe ISR.
// Devuelve valores con fallback a los de config.ts por si la fila no existe.
import { publicClient } from "@/lib/supabase/public";

export interface SiteConfig {
  telefono_intl: string;
  whatsapp_numero: string;
  horarios: { dias: string; horario: string }[];
  instagram_url: string;
  facebook_url: string;
  google_review_url: string;
  rooftop_url: string;
  banner_activo: boolean;
  banner_mensaje: string | null;
  banner_vence: string | null;
}

// Fallbacks: si la DB falla, el sitio no se queda sin datos de contacto.
const FALLBACK: SiteConfig = {
  telefono_intl: "+5493412023737",
  whatsapp_numero: "5493412023737",
 horarios: [
  { dias: "Lunes a jueves", horario: "8:30 a 00:30" },
  { dias: "Viernes", horario: "8:30 a 02:00" },
  { dias: "Sábados", horario: "9:00 a 02:00" },
  { dias: "Domingos", horario: "9:00 a 01:00" },
],
  instagram_url: "https://instagram.com/beatmemo_rosario",
  facebook_url: "https://www.facebook.com/beatmemopub",
  google_review_url: "https://g.page/r/CZ8oHnT2ZcQjEAE/review",
  banner_activo: false,
  banner_mensaje: null,
  banner_vence: null,
  rooftop_url: "https://instagram.com/beatmemo_rosario",
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const { data } = await publicClient
    .from("config_sitio")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return data ? { ...FALLBACK, ...data } : FALLBACK;
}

// El banner se muestra solo si está activo Y no venció.
export function bannerVisible(c: SiteConfig): boolean {
  if (!c.banner_activo || !c.banner_mensaje) return false;
  if (c.banner_vence && new Date(c.banner_vence) < new Date()) return false;
  return true;
}