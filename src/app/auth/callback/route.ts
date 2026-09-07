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
    return NextResponse.redirect(new URL("/admin/login?error=auth_failed", request.url));
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

     if (user && !next.startsWith("/admin/reauth")) {
        await logAdminAction('LOGIN_SUCCESS', 'auth.users',
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
    const resp = NextResponse.redirect(`${adminDomain}${next}`);   // ← respeta next, sin adivinar

    // Ventana sudo solo si el re-consentimiento vino del panel de roles.
    if (next === "/usuarios") {
      resp.cookies.set("sudo_until", String(Date.now() + 5 * 60 * 1000), {
        httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 300,
      });
    }
    return resp;
    }

    console.error("[Auth] Error en exchangeCodeForSession:", error.message);
  }
return NextResponse.redirect(new URL("/admin/login?error=auth_failed", request.url));
}