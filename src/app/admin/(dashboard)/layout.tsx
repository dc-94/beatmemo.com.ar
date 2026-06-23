// src/app/admin/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Lista blanca estricta (Whitelist). Solo estos correos pueden ver el panel.
// Puedes agregar los correos de tus socios o managers aquí separados por comas.
const ALLOWED_EMAILS = ["beatlesmemo.adm@gmail.com"];

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

  // 1. Verificación base: Si no hay usuario o el token expiró, lo echamos al login
  if (error || !data?.user) {
    redirect("/admin/login");
  }

  // 2. HARDENING (Whitelist): ¿Es un usuario autorizado por la empresa?
  const userEmail = data.user.email || "";
  if (!ALLOWED_EMAILS.includes(userEmail)) {
    // Si entró con un correo válido de Google pero que no es de tu empresa,
    // destruimos su sesión criptográfica y lo expulsamos.
    await supabase.auth.signOut(); 
    redirect("/admin/login?error=unauthorized");
  }

  // Si el guardia aprueba, renderizamos todo el panel de control
  return (
    <div className="min-h-screen bg-brand-black-100 flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}