"use server";

import { createClient } from "../lib/supabase/server";

// Como la base de datos cambió, definimos una interfaz ajustada para el Frontend
export interface PublicEvent {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  precio: number | null;
  es_gratuito: boolean;
  url_imagen: string;
  descripcion: string;
  integrantes: string;
  tipo: string;
  ciclos: { nombre: string } | null; // El JOIN trae esto como un objeto
}

/**
 * Helper: Obtiene la fecha absoluta actual en Argentina (YYYY-MM-DD)
 */
function getLocalTodayString() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

// 1. Obtener Shows por Vista (Agenda Principal)
export async function getShowsByView(view: 'past' | 'current' | 'next', year?: string, month?: string): Promise<PublicEvent[]> {
  const supabase = await createClient();
  const now = new Date();
  
  // Iniciamos la consulta en la tabla 'eventos'. 
  // Hacemos un JOIN con 'ciclos' para traer el nombre, y filtramos los borrados.
  let query = supabase
    .from("eventos")
    .select("*, ciclos(nombre)")
    .neq("is_deleted", true)
    .order("fecha", { ascending: true });

  if (view === 'past') {
    query = query.lt("fecha", getLocalTodayString()).order("fecha", { ascending: false });
  } else {
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    
    const startStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    query = query.gte("fecha", startStr).lte("fecha", endStr);
  }

  const { data, error } = await query;
  if (error) console.error("Error en getShowsByView:", error);
  return (data as PublicEvent[]) || [];
}

// 2. Obtener Próximos Shows (Para el Home)
export async function getUpcomingShows(): Promise<PublicEvent[]> {
  try {
    const supabase = await createClient();
    const todayString = getLocalTodayString();
    
    const { data, error } = await supabase
      .from("eventos")
      .select("*, ciclos(nombre)")
      .eq("is_deleted", false)
      .eq("tipo", "SHOW")
      .gte("fecha", todayString)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true }) // Orden secundario por hora
      .limit(6);

    if (error) throw error;
    return (data as PublicEvent[]) || [];
  } catch (err) {
    console.error("Error crítico en getUpcomingShows:", err);
    return [];
  }
}

// 3. Obtener Eventos Culturales
export async function getCulturalEvents(): Promise<PublicEvent[]> {
  try {
    const supabase = await createClient(); 
    const { data, error } = await supabase
      .from("eventos")
      .select("*, ciclos(nombre)")
      .eq("is_deleted", false)
      .eq("tipo", "EVENTO_CULTURAL")
      .gte("fecha", getLocalTodayString())
      .order("fecha", { ascending: true });

    if (error) throw error;
    return (data as PublicEvent[]) || [];
  } catch (err) {
    console.error("Error crítico en getCulturalEvents:", err);
    return [];
  }
}