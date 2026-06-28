"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Coffee, LayoutDashboard, FileText, Megaphone } from "lucide-react";

const navLinks = [
  { name: "Dash", href: "/admin", icon: LayoutDashboard },
  { name: "Shows", href: "/admin/shows", icon: Calendar },
  { name: "Menús", href: "/admin/menus", icon: FileText },
  { name: "Pub", href: "/admin/gastronomia", icon: Coffee },
  { name: "Banners", href: "/admin/banners", icon: Megaphone },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="flex justify-around items-center h-16 bg-black/90 backdrop-blur-md px-2">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
              isActive ? "text-white" : "text-neutral-500"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}