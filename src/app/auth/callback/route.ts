// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // Capturamos el parámetro
  let next = searchParams.get("next") ?? "/admin";

  // HARDENING (Prevención de Open Redirect):
  // Aseguramos que la redirección sea siempre a un path local.
  // Rechazamos dominios externos (ej: https://) o rutas relativas de protocolo (ej: //malicious.com)
  if (!next.startsWith("/") || next.startsWith("//")) {
    console.warn(`Intento de redirección externa bloqueado. Destino intentado: ${next}`);
    next = "/admin"; // Fallback a zona segura
  }

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              console.error("Error seteando cookies", error);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Error de Auth Supabase:", error.message);
    }
  }

  return NextResponse.redirect(`${origin}/?error=acceso_denegado`);
}