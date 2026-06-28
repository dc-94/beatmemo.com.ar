// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  const isSecureSubdomain = hostname.startsWith('secure.');
  const restrictedPaths = ['/admin', '/secure'];
  const isRestrictedPath = restrictedPaths.some(path => url.pathname.startsWith(path));

  // 1. BLOQUEO: Ocultar rutas en el dominio público
  if (!isSecureSubdomain && isRestrictedPath) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // 2. INICIALIZAR RESPUESTA Y SUPABASE
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 3. LÓGICA DE ENRUTAMIENTO PARA EL SUBDOMINIO (SECURE)
  if (isSecureSubdomain) {
    
    // EXCEPCIÓN VITAL: Dejar pasar el callback de Google tal cual
    if (url.pathname.startsWith('/auth/callback')) {
      return supabaseResponse;
    }

    // Seguridad: Si no hay usuario, forzar login
    if (!user && !url.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Evitar el bug de /admin/admin. Si ya dice /admin, lo limpiamos temporalmente.
    const cleanPath = url.pathname.startsWith('/admin') 
      ? url.pathname.replace('/admin', '') || '/' 
      : url.pathname;
    
    // Reescribimos internamente hacia la carpeta física /admin
    url.pathname = `/admin${cleanPath === '/' ? '' : cleanPath}`;
    
    // Preservamos las cookies de sesión en la reescritura
    const rewriteResponse = NextResponse.rewrite(url);
    supabaseResponse.cookies.getAll().forEach(cookie => {
      rewriteResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    });
    
    return rewriteResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};