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

/**
 * Resultado discriminado de lecturas públicas.
 *
 * ANTES: todo error se tragaba en un catch y se devolvía [], indistinguible
 * de una agenda genuinamente vacía. El bug del thenable estuvo en producción
 * disfrazado de "no hay shows programados" precisamente por esto.
 *
 * AHORA: la UI recibe el estado real y decide qué mostrar.
 * - ok: true  + data []        → vacío REAL ("no hay shows este mes")
 * - ok: false                  → fallo de datos (la UI muestra estado honesto,
 *                                 jamás inventa contenido)
 *
 * `error` es un código interno para logs/monitoring, NO para mostrar al
 * usuario: nunca filtrar mensajes crudos de Postgres/Supabase al browser.
 */
export type EventosResult =
  | { ok: true; data: PublicEvent[] }
  | { ok: false; data: []; error: string };

function fail(fnName: string, err: unknown): EventosResult {
  const e = err as {
    message?: string; code?: string; details?: string; hint?: string;
  };
  console.error(
    `[DATA_ERROR][${fnName}]`,
    JSON.stringify(
      { message: e?.message, code: e?.code, details: e?.details, hint: e?.hint },
      null, 2
    )
  );
  return { ok: false, data: [], error: e?.code ?? e?.message ?? "UNKNOWN" };
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

/** Sanitiza año/mes de searchParams (anti parameter-tampering). */
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
  try {
    const supabase = await createClient();

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
    return fail("getShowsByView", err);
  }
}

// ============================================================================
// 2. PRÓXIMOS SHOWS (Home)
// ============================================================================
export async function getUpcomingShows(): Promise<EventosResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await buildEventosBaseQuery(supabase)
      .eq("tipo", "SHOW")
      .gte("fecha", getLocalTodayString())
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })
      .limit(6);

    if (error) throw error;
    return { ok: true, data: (data as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail("getUpcomingShows", err);
  }
}

// ============================================================================
// 3. EVENTOS CULTURALES
// ============================================================================
export async function getCulturalEvents(): Promise<EventosResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await buildEventosBaseQuery(supabase)
      .eq("tipo", "EVENTO_CULTURAL")
      .gte("fecha", getLocalTodayString())
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) throw error;
    return { ok: true, data: (data as PublicEvent[]) ?? [] };
  } catch (err) {
    return fail("getCulturalEvents", err);
  }
}