// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  // Obtenemos el destino original si existe, sino por defecto a la raíz del subdominio (/)
  const next = requestUrl.searchParams.get("next") ?? "/";

  // HARDENING: Prevención de Open Redirect
  // Solo permitimos redirecciones que empiecen con "/" y no sean "//" (protocol-relative)
  if (!next.startsWith("/") || next.startsWith("//")) {
    console.warn(`[Seguridad] Intento de redirección externa bloqueado. Destino: ${next}`);
    return NextResponse.redirect(new URL("/login?error=invalid_redirect", request.url));
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
      // PRO: Usamos la variable de entorno para asegurar que siempre vamos al subdominio correcto
      // En desarrollo es: http://vault.localhost:3000
      // En producción será: https://vault.beatmemo.com
      const adminDomain = process.env.NEXT_PUBLIC_ADMIN_URL || "http://vault.localhost:3000";
      
      return NextResponse.redirect(`${adminDomain}${next}`);
    } else {
      console.error("Error de Auth Supabase:", error.message);
    }
  }

  // Si no hay código o hubo error, enviamos al login
  return NextResponse.redirect(new URL("/login", request.url));
}