// src/lib/shows-data.ts
// Lecturas públicas de eventos. NO es "use server"

import "server-only";
import { publicClient } from "@/lib/supabase/public";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  ciclos: { nombre: string; estilo_tema: string | null } | null;
}

export type EventosResult =
  | { ok: true; data: PublicEvent[] }
  | { ok: false; data: []; error: string };

// Columnas explícitas: nunca select("*") en queries public-facing.
const EVENTO_COLS =
  "id, titulo, fecha, hora, precio, es_gratuito, url_imagen, descripcion, integrantes, tipo, ciclos(nombre, estilo_tema)";

async function fail(fnName: string, err: unknown): Promise<EventosResult> {
  const e = err as { message?: string; code?: string; details?: string; hint?: string };
  const code = e?.code ?? e?.message ?? "UNKNOWN";

  console.error(
    `[DATA_ERROR][${fnName}]`,
    JSON.stringify({ message: e?.message, code: e?.code, details: e?.details, hint: e?.hint })
  );

  const stack =
    e?.details || e?.hint ? `details: ${e?.details ?? "-"} | hint: ${e?.hint ?? "-"}` : null;

  try {
    await publicClient.rpc("log_system_error", {
      p_message: `[${fnName}] ${e?.message ?? "Unknown error"}`,
      p_stack: stack,
      p_dedup_key: `shows:${fnName}:${code}`,
    });
  } catch (logErr) {
    console.error(`[DATA_ERROR][${fnName}] fallo al persistir en system_errors:`, logErr);
  }

  return { ok: false, data: [], error: code };
}

function getLocalTodayString(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

// Síncrono y recibe el cliente: nunca async devolviendo un builder (regla del thenable).
function buildEventosBaseQuery(supabase: SupabaseClient) {
  return supabase.from("eventos").select(EVENTO_COLS).eq("is_deleted", false);
}

function sanitizeYearMonth(year?: string, month?: string) {
  const now = new Date();
  const y = Number(year);
  const m = Number(month);
  const safeYear = Number.isInteger(y) && y >= 2020 && y <= 2100 ? y : now.getFullYear();
  const safeMonth = Number.isInteger(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1;
  return { safeYear, safeMonth };
}

// 1. SHOWS POR VISTA (/agenda)
export async function getShowsByView(
  view: "past" | "current" | "next",
  year?: string,
  month?: string
): Promise<EventosResult> {
  try {
    if (view === "past") {
      const { data, error } = await buildEventosBaseQuery(publicClient)
        .lt("fecha", getLocalTodayString())
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false })
        .order("id", { ascending: false });
      if (error) throw error;
      return { ok: true, data: (data as unknown as PublicEvent[]) ?? [] };
    }

    const { safeYear, safeMonth } = sanitizeYearMonth(year, month);
    const mm = String(safeMonth).padStart(2, "0");
    const lastDay = new Date(safeYear, safeMonth, 0).getDate();
    const hoy = getLocalTodayString();
    const primerDiaMes = `${safeYear}-${mm}-01`;
    const startStr = view === "current" && primerDiaMes < hoy ? hoy : primerDiaMes;
    const endStr = `${safeYear}-${mm}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await buildEventosBaseQuery(publicClient)
      .gte("fecha", startStr)
      .lte("fecha", endStr)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw error;
    return { ok: true, data: (data as unknown as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail("getShowsByView", err);
  }
}

// 2. PRÓXIMOS SHOWS (Home)
export async function getUpcomingShows(): Promise<EventosResult> {
  try {
    const { data, error } = await buildEventosBaseQuery(publicClient)
      .in("tipo", ["SHOW", "EVENTO_CULTURAL"])
      .gte("fecha", getLocalTodayString())
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })
      .order("id", { ascending: true })
      .limit(5);

    if (error) throw error;
    return { ok: true, data: (data as unknown as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail("getUpcomingShows", err);
  }
}

// 3. EVENTOS CULTURALES
export async function getCulturalEvents(): Promise<EventosResult> {
  try {
    const { data, error } = await buildEventosBaseQuery(publicClient)
      .eq("tipo", "EVENTO_CULTURAL")
      .gte("fecha", getLocalTodayString())
      .order("fecha", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw error;
    return { ok: true, data: (data as unknown as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail("getCulturalEvents", err);
  }
}