// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
      // Leer el usuario recién autenticado para registrar el evento
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Registrar el login en admin_logs — sin bloquear el redirect si falla
        await supabase.from("admin_logs").insert({
          action_type: 'LOGIN_SUCCESS', 
          table_name: 'auth.users',
          record_id: '00000000-0000-0000-0000-000000000000', // ID temporal
          metadata: {
            message: 'Login exitoso vía Google',
            user_id: user.id,
            email: user.email,
            role: user.app_metadata?.role ?? "UNKNOWN",
            provider: "google",
          },
        }).then(({ error: logError }) => {
          if (logError) console.error("[AuditLog] Error al registrar login:", logError.message);
        });
      }

      const adminDomain = process.env.NEXT_PUBLIC_ADMIN_URL || "http://vault.localhost:3000";
      return NextResponse.redirect(`${adminDomain}${next}`);
    }

    console.error("[Auth] Error en exchangeCodeForSession:", error.message);
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
}