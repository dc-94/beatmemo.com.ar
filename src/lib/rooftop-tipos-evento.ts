// src/lib/rooftop-tipos-evento.ts — lectura pública (publicClient → ISR) + fallback resiliente.
import { publicClient } from "@/lib/supabase/public";
import { TIPOS_EVENTO } from "@/lib/rooftop-data";

export interface TipoEventoPublico {
  id: string;
  num: string;
  titulo: { strong: string; light: string };
  descripcion: string;
  imagenes: string[];
}

export async function getTiposEventoPublicos(): Promise<TipoEventoPublico[]> {
  try {
    const { data, error } = await publicClient
      .from("rooftop_tipos_evento")
      .select("id, titulo_strong, titulo_light, descripcion, imagenes, orden")
      .eq("activo", true)
      .eq("is_deleted", false)
      .order("orden", { ascending: true });

    if (error) return TIPOS_EVENTO;              // conexión/consulta falló → no rompemos el landing
    if (!data || data.length === 0) return [];   // vacío legítimo (admin no cargó) → sección oculta

    return data.map((t, i) => ({
      id: t.id,
      num: String(i + 1).padStart(2, "0"),       // el "01/02…" sale del orden, no se guarda
      titulo: { strong: t.titulo_strong, light: t.titulo_light ?? "" },
      descripcion: t.descripcion ?? "",
      imagenes: Array.isArray(t.imagenes) ? (t.imagenes as string[]) : [],
    }));
  } catch {
    return TIPOS_EVENTO;
  }
}