// src/lib/rooftop-marcas.ts — lectura pública (publicClient → ISR).
import { publicClient } from "@/lib/supabase/public";

export interface MarcaPublica { id: string; nombre: string | null; logo_url: string }

export async function getMarcasPublicas(): Promise<MarcaPublica[]> {
  const { data } = await publicClient
    .from("rooftop_marcas")
    .select("id, nombre, logo_url, orden")
    .eq("activo", true)
    .eq("is_deleted", false)
    .order("orden", { ascending: true });
  return data ?? [];
}