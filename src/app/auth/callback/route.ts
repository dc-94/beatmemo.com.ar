// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Redirigir al panel de control si es exitoso
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    // IMPORTANTE: En Next.js 15+, cookies() es asíncrono y REQUIERE await
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Nueva sintaxis estandarizada de @supabase/ssr
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Este try/catch es necesario por cómo Next.js maneja las cookies 
              // en rutas de solo lectura, aunque en este Route Handler sí podemos escribir.
              console.error("Error seteando cookies", error);
            }
          },
        },
      }
    );

    // Canjeamos el código secreto de Google por una sesión válida
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Si todo sale bien, te redirigimos al panel de administración
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Error de Auth Supabase:", error.message);
    }
  }

  // Si algo falla, te devolvemos a la página principal con un error en la URL
  return NextResponse.redirect(`${origin}/?error=acceso_denegado`);
}