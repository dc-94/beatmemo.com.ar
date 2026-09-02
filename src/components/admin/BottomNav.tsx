"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "./nav-config";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function BottomNav({ erroresAbiertos = 0 }: { erroresAbiertos?: number }) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Centra el ítem activo (si quedó fuera del scroll al entrar a la sección).
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pathname]);

  const pubItem = ADMIN_NAV.find((n) => n.href === "/admin/pub");
  const showSub = pathname.startsWith("/admin/pub") && pubItem?.subItems;

  return (
    <div className="flex flex-col">
      {/* Sub-barra contextual de Pub */}
      {showSub && (
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-b border-white/10 bg-neutral-950/95 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pubItem!.subItems!.map((sub) => {
            const SubIcon = sub.icon;
            const active = pathname.startsWith(sub.href);
            return (
              <Link key={sub.href} href={sub.href}
                className={`flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${active ? "bg-white/15 text-white" : "text-neutral-400"}`}>
                <SubIcon size={13} />
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Nav principal: scroll horizontal con peek */}
      <div className="relative">
        <div className="flex overflow-x-auto h-14 items-stretch [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ADMIN_NAV.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={active ? activeRef : undefined}
                className={`flex-none w-[84px] flex flex-col items-center justify-center gap-0.5 relative transition-colors ${active ? "text-white" : "text-neutral-500"}`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium leading-none">{link.name}</span>
                {link.badge && erroresAbiertos > 0 && (
                  <span className="absolute top-1.5 right-[24px] w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
                )}
                {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full bg-white" />}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex-none w-[84px] flex flex-col items-center justify-center gap-0.5 text-neutral-500 text-red-400 transition-colors border-l border-white/10"
          >
            <LogOut size={18} />
            <span className="text-[9px] font-medium leading-none">Salir</span>
          </button>
        </div>
        {/* Fade derecho: refuerza que hay más para scrollear */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-black/90 to-transparent" />
      </div>
    </div>
  );
}