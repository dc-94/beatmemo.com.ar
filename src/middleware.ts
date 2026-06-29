// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Prefijo del subdominio admin — controlado por variable de entorno.
 * FIX: el original tenía hardcodeado 'secure.' cuando el proyecto usa 'vault.'
 *
 * .env.local:
 *   NEXT_PUBLIC_ADMIN_SUBDOMAIN_PREFIX=vault.
 *
 * Valores esperados:
 *   - Producción: vault.  → vault.beatmemo.com
 *   - Desarrollo:  vault. → vault.localhost:3000
 */
const ADMIN_PREFIX = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN_PREFIX ?? 'vault.';

/**
 * Rutas internas del servidor que deben ser invisibles desde el dominio público.
 * Si alguien las adivina en beatmemo.com, recibe un 404 HTTP real.
 */
const BLOCKED_ON_PUBLIC = ['/admin', '/secure'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') ?? '';
  const { pathname } = url;

  const isAdminSubdomain = hostname.startsWith(ADMIN_PREFIX);
  const isBlockedPath = BLOCKED_ON_PUBLIC.some((p) => pathname.startsWith(p));

  // ── REGLA 1: Devolver 404 real en el dominio público ──────────────────────
  // FIX: el original usaba NextResponse.rewrite('/404') que devuelve HTTP 200.
  // Los crawlers de Google indexaban esa URL como página válida.
  // new NextResponse(null, { status: 404 }) envía un 404 HTTP correcto.
  if (!isAdminSubdomain && isBlockedPath) {
    return new NextResponse(null, { status: 404 });
  }

  // ── REGLA 2: Bypass total del dominio público ──────────────────────────────
  // FIX (optimización): el original creaba un cliente Supabase en cada request
  // de la web pública aunque no fuera necesario. Ahora se cortocircuita acá.
  // A partir de esta línea, el código SOLO se ejecuta en el subdominio admin.
  if (!isAdminSubdomain) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // A partir de acá: estamos GARANTIZADOS en el subdominio admin (vault.*)
  // ──────────────────────────────────────────────────────────────────────────

  // ── REGLA 3: Bypass del callback OAuth (antes de instanciar Supabase) ─────
  // FIX: en el original, este check estaba DENTRO del bloque isSecureSubdomain
  // y DESPUÉS de instanciar Supabase, innecesariamente. El callback de Google
  // establece la sesión él mismo via exchangeCodeForSession() en la Route Handler.
  // No debe ser interceptado ni reescrito por el middleware.
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // ── INICIALIZAR CLIENTE SUPABASE con gestión correcta de cookies ───────────
  // Patrón oficial de @supabase/ssr para middleware de Next.js.
  // El cliente propaga automáticamente el refresh de tokens al browser.
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Paso 1: mutar las cookies del request para que los Server Components
          // puedan leer la sesión actualizada en el mismo ciclo de render.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Paso 2: recrear supabaseResponse con el request mutado.
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          // Paso 3: escribir las cookies en el response que llega al browser
          // (genera los headers Set-Cookie con secure, httpOnly, sameSite, etc.)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() valida el JWT contra el servidor de Supabase.
  // NO confiar solo en el token local — previene tokens robados o expirados.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname.startsWith('/login');

  // ── REGLA 4: Forzar autenticación ─────────────────────────────────────────
  // Sin sesión activa fuera de la página de login → redirigir al login.
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── REGLA 5: Prevenir acceso al login con sesión activa ───────────────────
  // FIX (mejora): el original no tenía este check. Un usuario ya autenticado
  // que visitaba /login veía el formulario de login en lugar del dashboard.
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ── REGLA 6: Rewrite interno hacia la carpeta física /admin ───────────────
  // El subdominio expone URLs limpias al usuario (vault.beatmemo.com/shows),
  // pero Next.js renderiza la carpeta src/app/admin internamente.
  //
  // FIX: el original usaba .replace('/admin', '') que es un string replace
  // que solo elimina la PRIMERA ocurrencia y puede producir resultados
  // incorrectos con inputs inesperados. .startsWith + .slice es determinista.
  //
  // Tabla de transformación:
  //   /              →  /admin          (dashboard principal)
  //   /shows         →  /admin/shows
  //   /menus         →  /admin/menus
  //   /admin         →  /admin          (idempotente — links del sidebar)
  //   /admin/shows   →  /admin/shows    (idempotente — links del sidebar)
  const normalized = pathname.startsWith('/admin')
    ? pathname.slice('/admin'.length) || '/'
    : pathname;

  url.pathname = normalized === '/' ? '/admin' : `/admin${normalized}`;

  const rewriteResponse = NextResponse.rewrite(url);

  // ── PROPAGACIÓN DE COOKIES AL REWRITE RESPONSE ────────────────────────────
  // FIX: el original pasaba `cookie.options` que no existe en ResponseCookie
  // (los atributos como httpOnly, secure, etc. son propiedades directas del objeto).
  // Esto causaba que las cookies se propagaran sin sus atributos de seguridad.
  //
  // Necesario cuando Supabase refreshea el access token durante el request:
  // el token nuevo debe llegar tanto al Server Component (via request.cookies)
  // como al browser (via Set-Cookie en el response final).
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...cookieOptions }) => {
    rewriteResponse.cookies.set(name, value, cookieOptions as Parameters<
      typeof rewriteResponse.cookies.set
    >[2]);
  });

  return rewriteResponse;
}

export const config = {
  matcher: [
    // Excluir del middleware: assets estáticos de Next.js, imágenes optimizadas,
    // favicon y archivos de imagen/fuente. Solo procesar páginas y API routes.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};