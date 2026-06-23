// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  // En Next.js 15+, cookies() es asíncrono. Debemos esperarlo.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Obtenemos todas las cookies en bloque para máxima eficiencia
        getAll() {
          return cookieStore.getAll();
        },
        // Seteamos/eliminamos cookies en bloque
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Regla estricta de Next.js: Los Server Components no pueden mutar cookies 
            // (no pueden enviar cabeceras HTTP porque el HTML ya empezó a enviarse).
            // Ignoramos el error aquí de forma segura. La actualización del token de 
            // sesión (refresh) será responsabilidad exclusiva del Middleware o Server Actions.
          }
        },
      },
    }
  );
}