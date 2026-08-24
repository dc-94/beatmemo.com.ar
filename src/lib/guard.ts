// src/lib/guard.ts
// Guardián único de server actions: sesión + rate limit + rol + log de
// intentos no autorizados. Toda action de mutación arranca llamándolo.
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import { ADMIN_ROLES } from "@/lib/auth-roles";
import { checkRateLimit, type LimitPreset } from "@/lib/rate-limit";

// Contrato único de respuesta de actions. Se importa desde acá con
// `import type { ActionResponse } from "@/lib/guard"`.
export interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  newId?: string;  
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type GuardResult =
  | {
      ok: true;
      supabase: SupabaseServerClient;
      user: { id: string; email?: string };
      role: string;
    }
  | { ok: false; response: ActionResponse };

interface GuardOptions {
  /** "UPDATE_PUB" → loguea "UNAUTHORIZED_UPDATE_PUB_ATTEMPT". Compatible con el trail existente. */
  intent: string;
  table: string;
  targetId?: string | null;
  limit?: LimitPreset | "none";
  roles?: readonly string[];
}

export async function guardAction({
  intent,
  table,
  targetId = null,
  limit = "mutation",
  roles = ADMIN_ROLES,
}: GuardOptions): Promise<GuardResult> {
  const supabase = await createClient();

  // 1. SESIÓN
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      ok: false,
      response: { success: false, error: "No autorizado. Sesión inválida." },
    };
  }

  // 2. RATE LIMIT — antes de la query de rol, a propósito: protege
  //    user_roles y acota cuántas filas puede escribir un atacante en el
  //    trail vía intentos no autorizados repetidos.
  //    Regla Crítica: el limiter RECIBE el cliente, no crea otro.
  if (limit !== "none") {
    const rl = await checkRateLimit(supabase, `${limit}:${user.id}`, limit);
    if (!rl.ok) {
      // NO va al trail de auditoría: si cada request bloqueado escribiera
      // una fila, el limiter sería un amplificador de flood de tu tabla.
      console.warn(
        `[rate-limit] ${user.id} bloqueado en ${intent}/${table}. Retry ${rl.retryAfter}s`
      );
      return {
        ok: false,
        response: {
          success: false,
          error: `Demasiadas operaciones seguidas. Probá de nuevo en ${rl.retryAfter} segundos.`,
        },
      };
    }
  }

  // 3. ROL — Database-First: la verdad vive en user_roles, no en el JWT.
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!roleData || !roles.includes(roleData.role)) {
    await logAdminAction(
      `UNAUTHORIZED_${intent}_ATTEMPT`,
      table,
      user.id,
      { email: user.email, target_id: targetId, role_actual: roleData?.role ?? null },
      targetId
    );
    return {
      ok: false,
      response: { success: false, error: "No tenés permisos para esta operación." },
    };
  }

  return {
    ok: true,
    supabase,
    user: { id: user.id, email: user.email ?? undefined },
    role: roleData.role,
  };
}