// src/components/admin/AdminNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  // Definimos las rutas del panel de control
  const tabs = [
    { name: "Shows", path: "/admin/shows" },
    { name: "Menú Pub", path: "/admin" }, // Por ahora el Pub es la ruta principal (/admin)
    { name: "QR Carta", path: "/admin/qr" },
    { name: "Configuración", path: "/admin/settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-black-100/95 backdrop-blur-md border-b border-brand-white-300/10">
      
      {/* Barra Superior */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="font-serif font-bold text-lg tracking-tight text-brand-white-100">
            BTM ADMIN
          </span>
        </div>
        <button className="text-brand-white-300 hover:text-brand-red-100 font-sans text-[10px] font-bold tracking-widest uppercase transition-colors">
          Salir
        </button>
      </div>

      {/* Pestañas (Scrollable en móviles) */}
      <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-6 gap-6 font-sans text-xs font-bold uppercase tracking-widest">
        {tabs.map((tab) => {
          // Lógica para saber si la pestaña está activa
          const isActive = pathname === tab.path;
          
          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={`py-3 whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "text-brand-red-100 border-brand-red-100"
                  : "text-brand-white-300 border-transparent hover:text-brand-white-100"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}