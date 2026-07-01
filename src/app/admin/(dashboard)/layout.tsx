// src/app/admin/(dashboard)/layout.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import Sidebar from "@/components/admin/Sidebar";
import BottomNav from "@/components/admin/BottomNav";
import { logAdminAction } from "@/lib/admin-logger"; // <--- IMPORTACIÓN CRÍTICA

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
  // Consultamos la fuente de verdad en tiempo real
  const { data: userData, error } = await supabase
    .from('user_roles') // Asegúrate de tener esta tabla
    .select('role')
    .eq('user_id', user.id)
    .single();
if (error || !userData) {
    console.error("[Auth] Error verificando rol en DB:", error?.message);
    await supabase.auth.signOut();
    redirect("/admin/login?error=db_error");
  }
  const role = userData?.role;
  const validRoles = ['SUPERADMIN', 'CONTENT_ADMIN'];
  const isAuthorized = role && validRoles.includes(role);
if (!isAuthorized) {
  // Auditoría silenciosa del intento fallido
  await logAdminAction('UNAUTHORIZED_ACCESS', 'admin_layout', { 
    email: user.email,
    attempted_role: role || 'NONE'
  });
  
  await supabase.auth.signOut();
  redirect("/admin/login?error=unauthorized");
}
  return (
<div className="flex h-screen w-full overflow-hidden bg-neutral-950">
        <Toaster position="top-right" theme="dark" richColors />
      <div className="flex h-screen overflow-hidden">
       <aside className="w-64 border-r border-white/10 hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </aside>
        <main className="flex-1 h-full overflow-y-auto bg-neutral-950 relative">
        <div className="p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 backdrop-blur-md z-50">
        <BottomNav />
      </nav>
    </div>
  );
}