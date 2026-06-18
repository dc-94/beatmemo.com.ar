"use server";

import { supabase } from "../lib/supabase";
import { Show } from "../types/database.types";

/**
 * 1. EXCLUSIVO PARA LA HOME: Obtiene los próximos 6 recitales desde hoy.
 * No modificar la firma de esta función para no romper el carrusel principal.
 */
export async function getUpcomingShows(): Promise<Show[]> {
  try {
    const today = new Date();
    today.setHours(today.getHours() - 3); 
    const todayString = today.toISOString().split('T')[0];
    const { data, error } = await supabase
      .from("shows")
      .select("id, banda, ciclo, fecha_hora, precio, url_imagen, descripcion, categoria")
      .eq("categoria", "shows")
      .gte("fecha_hora", todayString) // Compara contra el inicio del día local

      .order("fecha_hora", { ascending: true })
      .limit(6);

    if (error) {
      console.error("Error obteniendo shows para Home:", error.message);
      return getPlaceholdersFallback();
    }
    return (data as Show[]) || [];
  } catch (err) {
    console.error("Error crítico en getUpcomingShows:", err);
    return getPlaceholdersFallback();
  }
}

/**
 * 2. EXCLUSIVO PARA /shows (CARTELERA): Soporta filtrado por mes y año.
 * No tiene límite de 6, trae toda la grilla del mes solicitado.
 */
export async function getShowsList(year?: string, month?: string): Promise<Show[]> {
  try {
    let query = supabase
      .from("shows")
      .select("id, banda, ciclo, fecha_hora, precio, url_imagen, descripcion, categoria, integrantes, valor_espectaculo")
      .eq("categoria", "shows")
      .order("fecha_hora", { ascending: true });

    if (year && month) {
      // Filtrado estricto por mes
      const startDate = new Date(Number(year), Number(month) - 1, 1).toISOString();
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString();
      query = query.gte("fecha_hora", startDate).lte("fecha_hora", endDate);
    } else {
      // Por defecto: Todo desde hoy
      query = query.gte("fecha_hora", new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error filtrando cartelera de shows:", error.message);
      return getPlaceholdersFallback();
    }
    return (data as Show[]) || [];
  } catch (err) {
    console.error("Error crítico en getShowsList:", err);
    return getPlaceholdersFallback();
  }
}

/**
 * 3. EXCLUSIVO PARA /cultura: Obtiene solo mesas de idiomas y eventos culturales.
 */
export async function getCulturalEvents(): Promise<Show[]> {
  try {
    const { data, error } = await supabase
      .from("shows")
      .select("id, banda, ciclo, fecha_hora, precio, url_imagen, descripcion, categoria")
      .eq("categoria", "cultura")
      .gte("fecha_hora", new Date().toISOString())
      .order("fecha_hora", { ascending: true });

    if (error) {
      console.error("Error obteniendo cultura desde Supabase:", error.message);
      return getCulturalFallback();
    }
    return (data as Show[]) || [];
  } catch (err) {
    console.error("Error crítico en getCulturalEvents:", err);
    return getCulturalFallback();
  }
}

/* ========================================================= */
/* FUNCIONES DE RESPALDO (FALLBACKS)                         */
/* ========================================================= */

function getPlaceholdersFallback(): Show[] {
  return [
    {
      id: "mock-1",
      banda: "TIAGO & LOS PAJAROS",
      ciclo: "Pre Weekend Concert",
      fecha_hora: "2026-06-11T21:00:00Z",
      precio: 0,
      url_imagen: "/placeholders/hero/show.jpg",
      categoria: "shows",
      descripcion: "Show en vivo.",
      valor_espectaculo: 2500
    },
    {
      id: "mock-2",
      banda: "HUMAN NATURE",
      ciclo: "Rockin' Fridays",
      fecha_hora: "2026-06-12T22:00:00Z",
      precio: 0,
      url_imagen: "/placeholders/hero/cultural.png",
      categoria: "shows",
      descripcion: "Show en vivo.",
      valor_espectaculo: 3000
    }
  ];
}

function getCulturalFallback(): Show[] {
  return [
    {
      id: "mock-cultura-1",
      banda: "Edición Rock Nacional",
      ciclo: "Club del Vinilo",
      fecha_hora: "2026-06-17T20:00:00Z",
      precio: 0,
      url_imagen: "/placeholders/clubvinilo.png",
      categoria: "cultura",
      descripcion: "Noche de vinilos y melómanos."
    }
  ];
}