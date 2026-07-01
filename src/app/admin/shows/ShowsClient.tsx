// src/app/admin/shows/ShowsClient.tsx
"use client";

import { useState } from "react";
import EventDrawer from "@/components/admin/EventDrawer";

export default function ShowsClient({ initialCiclos }: { initialCiclos: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-red px-4 py-2 text-white rounded"
      >
        + Nuevo Evento
      </button>

      {/* IMPORTANTE: El Drawer debe estar fuera del flujo principal 
         para que su 'fixed' sea relativo a toda la ventana (viewport).
      */}
      <EventDrawer 
        ciclos={initialCiclos} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}