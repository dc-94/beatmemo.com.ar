// src/components/admin/ContenidoClient.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ContenidoForm, { type SeccionData } from "./ContenidoForm";

const NOMBRE_PAGINA: Record<string, string> = {
  pub: "Pub / Gastronomía",
  museo: "Museo",
  agenda: "Agenda de Shows",
};

export default function ContenidoClient({ secciones }: { secciones: SeccionData[] }) {
  const [abierta, setAbierta] = useState<string | null>(secciones[0]?.clave ?? null);

  // Orden estable: pub, museo, agenda (no el orden que devuelva la DB).
  const orden = ["pub", "museo", "agenda"];
  const ordenadas = [...secciones].sort((a, b) => orden.indexOf(a.clave) - orden.indexOf(b.clave));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif text-white">Contenido del Sitio</h1>
        <p className="text-neutral-400 text-sm">Editá el encabezado de cada página pública.</p>
      </div>

      <div className="space-y-3">
        {ordenadas.map((sec) => {
          const expandida = abierta === sec.clave;
          return (
            <div key={sec.clave} className="border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setAbierta(expandida ? null : sec.clave)}
                className="w-full flex items-center justify-between px-5 py-4 bg-neutral-900 hover:bg-neutral-800 transition"
              >
                <span className="font-semibold text-white">{NOMBRE_PAGINA[sec.clave] ?? sec.clave}</span>
                <ChevronDown size={18} className={`text-neutral-400 transition-transform ${expandida ? "rotate-180" : ""}`} />
              </button>

              {expandida && (
                <div className="p-5 bg-neutral-950 border-t border-white/5">
                  <ContenidoForm seccion={sec} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}