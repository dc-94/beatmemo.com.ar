// src/actions/log-client-error.ts
"use server";

import { publicClient } from "@/lib/supabase/public";

export async function logClientError(mensaje: string, digest?: string, ruta?: string) {
  try {
    const dedupKey = `client:${ruta ?? "unknown"}:${digest ?? mensaje.slice(0, 40)}`;
    await publicClient.rpc("log_system_error", {
      p_message: `[CLIENT] ${mensaje}`,
      p_stack: [digest ? `digest: ${digest}` : null, ruta ? `ruta: ${ruta}` : null].filter(Boolean).join(" | ") || null,
      p_dedup_key: dedupKey,
    });
  } catch (e) {
    console.error("[logClientError] no se pudo persistir:", e);
  }
}