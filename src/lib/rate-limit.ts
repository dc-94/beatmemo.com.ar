// src/lib/rate-limit.ts
// Rate limiting sobre Postgres (Supabase RPC). Sin vendors, sin env vars,
// sin modos de falla propios: si Supabase está caída, la app ya está caída.
import "server-only";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const PRESETS = {
  mutation: { tokens: 5, windowSecs: 60 },
  upload:   { tokens: 5,  windowSecs: 60 },
  auth:     { tokens: 5,  windowSecs: 60 },  
} as const;

export type LimitPreset = keyof typeof PRESETS;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "limit_exceeded"; retryAfter: number };

/**
 * REGLA CRÍTICA: recibe el cliente como parámetro, no lo crea.
 * El guard ya lo tiene instanciado; crear otro duplicaría el handshake.
 */
export async function checkRateLimit(
  supabase: SupabaseServerClient,
  identifier: string,
  preset: LimitPreset = "mutation"
): Promise<RateLimitResult> {
  const p = PRESETS[preset];

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: identifier,
    p_limit: p.tokens,
    p_window_secs: p.windowSecs,
  });

  if (error) {
    // Fail-open, y FAIL-FAST de verdad: un RPC contra la misma DB
    // responde o falla en milisegundos. Nada de backoffs de 5 segundos.
    console.error("[rate-limit] RPC falló. Dejando pasar.", error);
    return { ok: true };
  }

  // returns table → llega como array de una fila.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error("[rate-limit] RPC sin filas. Dejando pasar.");
    return { ok: true };
  }

  if (row.allowed) return { ok: true };
  return { ok: false, reason: "limit_exceeded", retryAfter: row.retry_after ?? 60 };
}