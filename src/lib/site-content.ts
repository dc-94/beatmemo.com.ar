// src/lib/site-content.ts
// Lectura del contenido editable de una página. publicClient (sin cookies)
// para no romper el ISR. Devuelve null si la fila no existe — la página
// debe tener fallbacks para ese caso.
import { publicClient } from "@/lib/supabase/public";

export interface SiteContent {
  clave: string;
  imagen_url: string | null;
  alt_texto: string | null;
  titulo: string | null;
  subtitulo: string | null;
  cuerpo: string | null;
  cta_mostrar: boolean;
  cta_texto: string | null;
  cta_link: string | null;
}

export async function getSiteContent(clave: string): Promise<SiteContent | null> {
  const { data } = await publicClient
    .from("site_content")
    .select("clave, imagen_url, alt_texto, titulo, subtitulo, cuerpo, cta_mostrar, cta_texto, cta_link")
    .eq("clave", clave)
    .maybeSingle(); // maybeSingle: no explota si no hay fila, devuelve null

  return data;
}