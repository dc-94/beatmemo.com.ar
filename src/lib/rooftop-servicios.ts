// src/lib/rooftop-servicios.ts — lectura pública (publicClient → ISR) + fallback resiliente.
import { publicClient } from "@/lib/supabase/public";
import { SERVICIOS } from "@/lib/rooftop-data";

export interface ServicioItem { texto: string; detalle?: string }
export interface ServiciosData { titulo: string; subtitulo: string; imagen_url: string; items: ServicioItem[] }

// Fallback SOLO si cae la conexión: la lista de texto es contenido real (no placeholder);
// la imagen queda vacía a propósito (no metemos foto placeholder).
const FALLBACK: ServiciosData = { titulo: "Servicios", subtitulo: "Todo incluido", imagen_url: "", items: SERVICIOS };

export async function getServiciosPublico(): Promise<ServiciosData> {
  try {
    const [sec, lista] = await Promise.all([
      publicClient.from("rooftop_secciones").select("titulo, subtitulo, imagen_url").eq("clave", "servicios").maybeSingle(),
      publicClient.from("rooftop_servicios").select("texto, detalle, orden").eq("activo", true).eq("is_deleted", false).order("orden", { ascending: true }),
    ]);

    if (sec.error || lista.error) return FALLBACK;         // conexión caída → no rompemos el landing

    const items = (lista.data ?? []).map((s) => ({ texto: s.texto, detalle: s.detalle || undefined }));
    const d = sec.data;
    return {
      titulo: d?.titulo || "Servicios",
      subtitulo: d?.subtitulo || "Todo incluido",
      imagen_url: d?.imagen_url || "",
      items,   // puede quedar [] → el componente oculta la sección
    };
  } catch {
    return FALLBACK;
  }
}