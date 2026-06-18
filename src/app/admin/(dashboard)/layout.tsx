// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // En Next.js 15/16, las cookies son asíncronas
  const cookieStore = await cookies();

  // Inicializamos el cliente SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Next.js ignora set() en layouts de solo lectura de forma intencional, 
            // el refresh de tokens ocurre en Server Actions o Route Handlers.
          }
        },
      },
    }
  );

  // Verificación estricta criptográfica: ¿Este usuario es legítimo?
  const { data, error } = await supabase.auth.getUser();

  // Si no hay usuario o el token expiró, lo echamos de la ruta
  if (error || !data?.user) {
    redirect("/admin/login");
  }

  // Si el guardia aprueba, renderizamos todo el panel de control
  return (
    <div className="min-h-screen bg-brand-black-100 flex flex-col">
      {/* Podríamos poner un Navbar interno exclusivo del Admin aquí arriba */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}