// src/components/admin/WhiskiesClient.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import WhiskyDrawer from "./WhiskyDrawer";

const COL_LABEL: Record<string, string> = {
  blended: "Blended", blended_malts: "Blended Malts", irish: "Irish",
  single_malt: "Single Malt", bourbon: "Bourbon",
};

export default function WhiskiesClient({ whiskies }: { whiskies: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(undefined);

  const abrir = (w?: any) => { setEditing(w); setIsOpen(true); };

  // Agrupar por colección para el listado.
  const porColeccion = whiskies.reduce((acc, w) => {
    (acc[w.coleccion] ??= []).push(w);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">Whisky Collection</h1>
          <p className="text-neutral-400 text-sm">{whiskies.length} etiquetas cargadas</p>
        </div>
        <button onClick={() => abrir()} className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded transition text-sm">
          <Plus size={16} /> Nuevo whisky
        </button>
      </div>

      {whiskies.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          No hay whiskies cargados. Agregá el primero.
        </div>
      ) : (
        Object.entries(porColeccion).map(([col, lista]) => (
          <div key={col}>
            <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold mb-2">{COL_LABEL[col] ?? col}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(lista as any[]).map((w) => (
                <button key={w.id} onClick={() => abrir(w)}
                  className="text-left bg-neutral-900 border border-white/10 rounded-lg p-3 hover:bg-white/5 transition flex items-center gap-3">
                  {w.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.logo_url} alt="" className="h-8 w-16 object-contain shrink-0" />
                  ) : (
                    <div className="h-8 w-16 bg-neutral-800 rounded shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{w.marca}</p>
                    {w.expresion && <p className="text-neutral-500 text-xs truncate">{w.expresion}</p>}
                  </div>
                  {w.tiene_hh && <span className="text-[9px] uppercase text-brand-gold border border-brand-gold/40 rounded px-1 shrink-0">HH</span>}
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      <WhiskyDrawer
        key={editing?.id ?? "new"}
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEditing(undefined); }}
        whiskyToEdit={editing}
      />
    </div>
  );
}