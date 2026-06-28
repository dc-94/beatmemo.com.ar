import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import Sidebar from "@/components/admin/Sidebar";
import BottomNav from "@/components/admin/BottomNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* El middleware maneja las cookies, el layout es de lectura */ }
      },
    }
  );

  // 1. Verificación de Autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Verificación de Autorización (RBAC)
  // Usamos la función SQL que creamos: public.get_auth_role()
  const { data: role, error } = await supabase.rpc('get_auth_role');

  if (error || !role || role === 'VISITOR') {
    // Si no es CM o SUPERADMIN, expulsamos.
    // Opcional: destruir sesión
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-red-100">
      {/* Sistema de Notificaciones Minimalista */}
      <Toaster position="top-right" theme="dark" richColors />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-64 border-r border-white/10 flex-col">
          <Sidebar />
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 pb-20 md:pb-0">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Navegación Móvil (Solo visible en pantallas pequeñas) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 backdrop-blur-md z-50">
        <BottomNav />
      </nav>
    </div>
  );
}