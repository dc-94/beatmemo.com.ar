// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // Capturamos el parámetro
  let next = searchParams.get("next") ?? "/";

  // HARDENING (Prevención de Open Redirect)
  if (!next.startsWith("/") || next.startsWith("//")) {
    console.warn(`[Seguridad] Intento de redirección externa bloqueado. Destino: ${next}`);
    next = "/"; // Fallback a zona segura
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
              console.error("Error seteando cookies en callback", error);
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