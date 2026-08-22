// src/lib/pub-data.ts
// Todo lo que /pub necesita leer, en un lugar. publicClient → no rompe ISR.
import { publicClient } from "@/lib/supabase/public";

export interface PubItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  url_imagen: string | null;
  categoria: string;
  faceta: string | null;
  ingredientes: string[] | null;
  tags: string[];
  es_vegetariano: boolean;
  es_vegano: boolean;
  es_sin_tacc: boolean;
  es_nuevo: boolean;
  es_recomendado: boolean;
}

export interface Whisky {
  id: string;
  marca: string;
  expresion: string | null;
  coleccion: string;
  logo_url: string | null;
  tiene_hh: boolean;
}

export interface EspacioFoto {
  id: string;
  imagen_url: string;
  titulo: string | null;
  epigrafe: string | null;
}

// Trae los items de /pub agrupados por faceta. Una sola query, agrupada en JS.
export async function getPubFacetas(): Promise<Record<string, PubItem[]>> {
  const { data } = await publicClient
    .from("pub")
    .select("id, nombre, descripcion, url_imagen, categoria, faceta, ingredientes, tags, es_vegetariano, es_vegano, es_sin_tacc, es_nuevo, es_recomendado")
    .eq("is_deleted", false)
    .eq("disponible", true)
    .not("faceta", "is", null)
    .order("orden", { ascending: true });

  const items = (data as PubItem[]) ?? [];
  return items.reduce((acc, item) => {
    const f = item.faceta!;
    (acc[f] ??= []).push(item);
    return acc;
  }, {} as Record<string, PubItem[]>);
}

export async function getWhiskies(): Promise<Whisky[]> {
  const { data } = await publicClient
    .from("whiskies")
    .select("id, marca, expresion, coleccion, logo_url, tiene_hh")
    .eq("is_deleted", false)
    .eq("disponible", true)
    .order("coleccion", { ascending: true })
    .order("orden", { ascending: true });
  return (data as Whisky[]) ?? [];
}

export async function getEspacioFotos(): Promise<EspacioFoto[]> {
  const { data } = await publicClient
    .from("espacio_galeria")
    .select("id, imagen_url, titulo, epigrafe")
    .eq("is_deleted", false)
    .eq("visible", true)
    .order("orden", { ascending: true });
  return (data as EspacioFoto[]) ?? [];
}