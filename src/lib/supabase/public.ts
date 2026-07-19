// src/lib/supabase/public.ts
// Cliente ANÓNIMO para lecturas públicas (home, /pub, /agenda…).
// NO lee cookies: en Next, cookies() fuerza render dinámico y mata el ISR.
// Una lectura pública no necesita saber quién mira — usar este cliente
// permite que la página se cachee con revalidate.
// PROHIBIDO usarlo en mutaciones o rutas admin: para eso está createClient
// de lib/supabase/server (con sesión) vía guardAction.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const publicClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);