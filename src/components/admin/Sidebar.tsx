"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, ChevronDown} from "lucide-react";
import { ADMIN_NAV as navLinks, type NavItem } from "./nav-config";

export default function Sidebar({ erroresAbiertos = 0 }: { erroresAbiertos?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [pubOpen, setPubOpen] = useState(pathname.startsWith("/admin/pub"));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); 
    router.refresh();
  };


  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="flex flex-col h-full p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-tight text-white">BEATMEMO</h1>
        <p className="text-xs text-neutral-500">Panel de Control</p>
      </div>

      <div className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          if (link.subItems) {
            return (
              <div key={link.name}>
                <button
                  onClick={() => setPubOpen((v) => !v)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active ? "text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{link.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${pubOpen ? "rotate-180" : ""}`} />
                </button>

                {pubOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {link.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = pathname.startsWith(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            subActive ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <SubIcon size={15} />
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{link.name}</span>
              {link.badge && erroresAbiertos > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {erroresAbiertos}
                </span>
              )}
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