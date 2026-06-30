"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Calendar, Coffee, LayoutDashboard, LogOut, 
  FileText, Megaphone, ShieldAlert // Añadido ShieldAlert
} from "lucide-react";

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Shows", href: "/admin/shows", icon: Calendar },
  { name: "Menús", href: "/admin/menus", icon: FileText },
  { name: "Gastronomía", href: "/admin/gastronomia", icon: Coffee },
  { name: "Banners", href: "/admin/banners", icon: Megaphone },
  { name: "Auditoría", href: "/admin/logs", icon: ShieldAlert }, // Nuevo ítem
];


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // O la ruta de login que definimos
    router.refresh();
  };

  return (
    <nav className="flex flex-col h-full p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-tight text-white">BEATMEMO</h1>
        <p className="text-xs text-neutral-500">Panel de Control</p>
      </div>

      <div className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-red-400 transition-colors mt-auto border-t border-white/5 pt-4"
      >
        <LogOut size={18} />
        Cerrar Sesión
      </button>
    </nav>
  );
}