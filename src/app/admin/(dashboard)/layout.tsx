// src/app/admin/(dashboard)/layout.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Toaster } from "sonner";

import Sidebar from "@/components/admin/Sidebar";
import BottomNav from "@/components/admin/BottomNav";

import { logAdminAction } from "@/lib/admin-logger"; 
import { isAdminRole } from "@/lib/auth-roles";

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
        setAll() { /* El middleware se encarga */ }
      },
    }
  );
const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");


  
  // REFACTOR: Database-First
  const { data: userData, error } = await supabase
    .from('user_roles') 
    .select('role')
    .eq('user_id', user.id)
    .single();
if (error || !userData) {
    console.error("[Auth] Error verificando rol en DB:", error?.message);
    await supabase.auth.signOut();
    redirect("/admin/login?error=db_error");
  }
  const role = userData?.role;
  const isAuthorized = isAdminRole(role);
 if (!isAuthorized) {
    // VISITOR logueado
    await logAdminAction(
      "UNAUTHORIZED_ACCESS",
      "admin_layout",
      user.id,
      { email: user.email, attempted_role: role || "NONE" }
    );

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-center px-6">
        <div className="max-w-md">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-white mb-3">Cuenta pendiente de aprobación</h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Tu ingreso con <span className="text-neutral-200">{user.email}</span> fue registrado.
            En cuanto un administrador apruebe tu cuenta, vas a poder acceder al panel.
          </p>
          <form action="/auth/signout" method="post">
            <button className="text-xs uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border-b border-neutral-700 hover:border-white pb-1">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

const { count: erroresAbiertos } = await supabase
  .from("system_errors")
  .select("*", { count: "exact", head: true })
  .eq("resolved", false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950 [color-scheme:dark]">
      <Toaster position="top-right" theme="dark" richColors />

      <aside className="w-64 border-r border-white/10 hidden md:flex flex-col flex-shrink-0">
        <Sidebar erroresAbiertos={erroresAbiertos ?? 0} role={role} />
      </aside>

      <main className="flex-1 h-full overflow-y-auto bg-neutral-950 relative pt-2">
        <div className="p-4 pb-28 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 backdrop-blur-md z-50">
        <BottomNav erroresAbiertos={erroresAbiertos ?? 0} role={role} />
      </nav>
    </div>
  );
}