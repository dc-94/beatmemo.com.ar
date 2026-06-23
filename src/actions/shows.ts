"use server";

import { createClient } from "../lib/supabase/server";
import { Show } from "../types/database.types";

/**
 * Helper: Obtiene la fecha absoluta actual en Argentina (YYYY-MM-DD)
 * Evita el bug de la medianoche UTC de Vercel.
 */
function getLocalTodayString() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

export async function getUpcomingShows(): Promise<Show[]> {
  try {
    const supabase = await createClient(); // Cliente seguro de servidor (SSR)
    const todayString = getLocalTodayString();
    
    const { data, error } = await supabase
      .from("shows")
      .select("id, banda, ciclo, fecha_hora, precio, url_imagen, descripcion, categoria")
      .eq("categoria", "shows")
      .gte("fecha_hora", todayString)
      .order("fecha_hora", { ascending: true })
      .limit(6);

    if (error) throw error;
    return (data as Show[]) || [];
  } catch (err) {
    console.error("Error crítico en getUpcomingShows:", err);
    return getPlaceholdersFallback();
  }
}

export async function getShowsList(year?: string, month?: string): Promise<Show[]> {
  try {
    const supabase = await createClient(); // Cliente seguro
    let query = supabase
      .from("shows")
      .select("id, banda, ciclo, fecha_hora, precio, url_imagen, descripcion, categoria, integrantes, valor_espectaculo")
      .eq("categoria", "shows")
      .order("fecha_hora", { ascending: true });

    if (year && month) {
      // VALIDACIÓN ESTRICTA (Hardening)
      const safeYear = parseInt(year, 10);
      const safeMonth = parseInt(month, 10);
      
      if (isNaN(safeYear) || safeYear < 2024 || safeYear > 2030 || isNaN(safeMonth) || safeMonth < 1 || safeMonth > 12) {
        console.warn("Intento de inyección o parámetros inválidos en URL");
        return [];
      }

      const startDate = new Date(safeYear, safeMonth - 1, 1).toISOString();
      const endDate = new Date(safeYear, safeMonth, 0, 23, 59, 59).toISOString();
      query = query.gte("fecha_hora", startDate).lte("fecha_hora", endDate);
    } else {
      query = query.gte("fecha_hora", getLocalTodayString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Show[]) || [];
  } catch (err) {
    console.error("Error crítico en getShowsList:", err);
    return getPlaceholdersFallback();
  }
}

export async function getCulturalEvents(): Promise<Show[]> {
  try {
    const supabase = await createClient(); // Cliente seguro
    const { data, error } = await supabase
      .from("shows")
      .select("id, banda, ciclo, fecha_hora, precio, url_imagen, descripcion, categoria")
      .eq("categoria", "cultura")
      .gte("fecha_hora", getLocalTodayString())
      .order("fecha_hora", { ascending: true });

    if (error) throw error;
    return (data as Show[]) || [];
  } catch (err) {
    console.error("Error crítico en getCulturalEvents:", err);
    return getCulturalFallback();
  }
}

/* ========================================================= */
/* FUNCIONES DE RESPALDO (FALLBACKS) - SIN CAMBIOS           */
/* ========================================================= */
function getPlaceholdersFallback(): Show[] {
  return [
    { id: "mock-1", banda: "TIAGO & LOS PAJAROS", ciclo: "Pre Weekend Concert", fecha_hora: "2026-06-11T21:00:00Z", precio: 0, url_imagen: "/placeholders/hero/show.jpg", categoria: "shows", descripcion: "Show en vivo.", valor_espectaculo: 2500 },
    { id: "mock-2", banda: "HUMAN NATURE", ciclo: "Rockin' Fridays", fecha_hora: "2026-06-12T22:00:00Z", precio: 0, url_imagen: "/placeholders/hero/cultural.png", categoria: "shows", descripcion: "Show en vivo.", valor_espectaculo: 3000 }
  ];
}

function getCulturalFallback(): Show[] {
  return [
    { id: "mock-cultura-1", banda: "Edición Rock Nacional", ciclo: "Club del Vinilo", fecha_hora: "2026-06-17T20:00:00Z", precio: 0, url_imagen: "/placeholders/clubvinilo.png", categoria: "cultura", descripcion: "Noche de vinilos." }
  ];
}