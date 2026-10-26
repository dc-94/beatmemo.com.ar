// src/lib/rooftop-galeria.ts — lectura pública (publicClient → ISR).
import { publicClient } from "@/lib/supabase/public";

export interface FotoPublica { id: string; imagen_url: string; subtitulo: string; ancho: number; alto: number }
export interface DescubriData { titulo: string; subtitulo: string; fotos: FotoPublica[] }

export async function getDescubriPublico(): Promise<DescubriData> {
  try {
    const [sec, gal] = await Promise.all([
      publicClient.from("rooftop_secciones").select("titulo, subtitulo").eq("clave", "descubri").maybeSingle(),
      publicClient.from("rooftop_galeria").select("id, imagen_url, subtitulo, ancho, alto, orden")
        .eq("activo", true).eq("is_deleted", false).order("orden", { ascending: true }),
    ]);

    if (gal.error) return { titulo: "", subtitulo: "", fotos: [] };   // error → sección oculta

    const fotos = (gal.data ?? []).map((f) => ({
      id: f.id, imagen_url: f.imagen_url, subtitulo: f.subtitulo ?? "", ancho: f.ancho ?? 0, alto: f.alto ?? 0,
    }));
    const d = sec.data;
    return { titulo: d?.titulo || "Descubrí el rooftop", subtitulo: d?.subtitulo || "El espacio", fotos };
  } catch {
    return { titulo: "", subtitulo: "", fotos: [] };
  }
}