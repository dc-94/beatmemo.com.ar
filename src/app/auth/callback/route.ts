// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logAdminAction } from "@/lib/admin-logger";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!next.startsWith("/") || next.startsWith("//")) {
    console.warn(`[Seguridad] Redirección externa bloqueada: ${next}`);
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
            } catch { /* Server Component — ignorar error de mutación */ }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Unificado: mismo helper que el resto de la auditoría.
        // record_id queda null (un login no afecta a un registro puntual);
        // admin_id se llena con el UUID real del usuario que ingresó.
        await logAdminAction(
          'LOGIN_SUCCESS',
          'auth.users',
          user.id,
          {
            message: 'Login exitoso vía Google',
            email: user.email,
            role: user.app_metadata?.role ?? "UNKNOWN",
            provider: "google",
          }
        );
      }

      const adminDomain = process.env.NEXT_PUBLIC_ADMIN_URL || "http://vault.localhost:3000";
      return NextResponse.redirect(`${adminDomain}${next}`);
    }

    console.error("[Auth] Error en exchangeCodeForSession:", error.message);
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
}