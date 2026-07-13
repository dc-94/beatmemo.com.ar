// src/actions/shows.ts
"use server";

import { createClient } from "../lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// TIPOS
// ============================================================================
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
  ciclos: { nombre: string } | null;
}

export type EventosResult =
  | { ok: true; data: PublicEvent[] }
  | { ok: false; data: []; error: string };

/**
 * Registra un fallo de datos. Doble destino:
 *  1. console.error con prefijo [DATA_ERROR] → visible en logs de Vercel (efímero).
 *  2. system_errors vía RPC log_system_error → persistente y buscable.
 *
 * La RPC corre SECURITY DEFINER con guarda anti-flood de 60s: el contexto
 * público no escribe directo en la tabla, invoca la función controlada.
 * El logueo NUNCA tumba la respuesta: si la RPC falla, seguimos.
 */
async function fail(
  supabase: SupabaseClient,
  fnName: string,
  err: unknown
): Promise<EventosResult> {
  const e = err as { message?: string; code?: string; details?: string; hint?: string };
  const code = e?.code ?? e?.message ?? "UNKNOWN";

  console.error(
    `[DATA_ERROR][${fnName}]`,
    JSON.stringify({ message: e?.message, code: e?.code, details: e?.details, hint: e?.hint })
  );

  // dedup_key agrupa el mismo error de la misma función dentro de la ventana.
  const dedupKey = `shows:${fnName}:${code}`;
  const message = `[${fnName}] ${e?.message ?? "Unknown error"}`;
  const stack = e?.details || e?.hint
    ? `details: ${e?.details ?? "-"} | hint: ${e?.hint ?? "-"}`
    : null;

  try {
    await supabase.rpc("log_system_error", {
      p_message: message,
      p_stack: stack,
      p_dedup_key: dedupKey,
    });
  } catch (logErr) {
    console.error(`[DATA_ERROR][${fnName}] fallo al persistir en system_errors:`, logErr);
  }

  return { ok: false, data: [], error: code };
}

// ============================================================================
// HELPERS
// ============================================================================
function getLocalTodayString(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/**
 * ⚠️ REGLA CRÍTICA: los query builders de Supabase son thenables; un `await`
 * sobre ellos EJECUTA la query. Este helper es SÍNCRONO y recibe el cliente
 * por parámetro. Nunca convertirlo en async ni hacerle await. (Ver AGENTS.md)
 */
function buildEventosBaseQuery(supabase: SupabaseClient) {
  return supabase
    .from("eventos")
    .select("*, ciclos(nombre)")
    .eq("is_deleted", false);
}

function sanitizeYearMonth(year?: string, month?: string) {
  const now = new Date();
  const y = Number(year);
  const m = Number(month);
  const safeYear =
    Number.isInteger(y) && y >= 2020 && y <= 2100 ? y : now.getFullYear();
  const safeMonth =
    Number.isInteger(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1;
  return { safeYear, safeMonth };
}

// ============================================================================
// 1. SHOWS POR VISTA (/agenda)
// ============================================================================
export async function getShowsByView(
  view: "past" | "current" | "next",
  year?: string,
  month?: string
): Promise<EventosResult> {
  const supabase = await createClient();
  try {
    if (view === "past") {
      const { data, error } = await buildEventosBaseQuery(supabase)
        .lt("fecha", getLocalTodayString())
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false });

      if (error) throw error;
      return { ok: true, data: (data as PublicEvent[]) ?? [] };
    }

    const { safeYear, safeMonth } = sanitizeYearMonth(year, month);
    const mm = String(safeMonth).padStart(2, "0");
    const lastDay = new Date(safeYear, safeMonth, 0).getDate();
    const startStr = `${safeYear}-${mm}-01`;
    const endStr = `${safeYear}-${mm}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await buildEventosBaseQuery(supabase)
      .gte("fecha", startStr)
      .lte("fecha", endStr)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) throw error;
    return { ok: true, data: (data as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail(supabase, "getShowsByView", err);
  }
}

// ============================================================================
// 2. PRÓXIMOS SHOWS (Home)
// ============================================================================
export async function getUpcomingShows(): Promise<EventosResult> {
  const supabase = await createClient();
  try {
    const { data, error } = await buildEventosBaseQuery(supabase)
      .eq("tipo", "SHOW")
      .gte("fecha", getLocalTodayString())
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })
      .limit(6);

    if (error) throw error;
    return { ok: true, data: (data as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail(supabase, "getUpcomingShows", err);
  }
}

// ============================================================================
// 3. EVENTOS CULTURALES
// ============================================================================
export async function getCulturalEvents(): Promise<EventosResult> {
  const supabase = await createClient();
  try {
    const { data, error } = await buildEventosBaseQuery(supabase)
      .eq("tipo", "EVENTO_CULTURAL")
      .gte("fecha", getLocalTodayString())
      .order("fecha", { ascending: true });

    if (error) throw error;
    return { ok: true, data: (data as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail(supabase, "getCulturalEvents", err);
  }
}