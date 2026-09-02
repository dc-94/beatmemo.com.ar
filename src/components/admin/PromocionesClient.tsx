// src/components/admin/PromocionesClient.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import PromoDrawer from "./PromoDrawer";
import PromoCard from "@/components/home/PromoCard";
import { estadoPromo, type PromoData } from "@/lib/promo-helpers";
import Button from "@/components/ui/Button";

interface Promo extends PromoData {
  id: string;
  prioridad: number;
}

const META = {
  vigente:    { txt: "Vigente hoy", color: "text-green-500",   dot: "bg-green-500" },
  programada: { txt: "Programada",  color: "text-amber-500",   dot: "bg-amber-500" },
  vencida:    { txt: "Vencida",     color: "text-red-500",     dot: "bg-red-500" },
  inactiva:   { txt: "Inactiva",    color: "text-neutral-500", dot: "bg-neutral-500" },
} as const;

export default function PromocionesClient({ promos }: { promos: Promo[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | undefined>(undefined);

  const openNew = () => { setEditing(undefined); setIsOpen(true); };
  const openEdit = (p: Promo) => { setEditing(p); setIsOpen(true); };

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Promociones</h1>
          <p className="text-neutral-400 text-sm">{promos.length} promos · así se ven en el home</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> Nueva
        </Button>
      </header>

      {promos.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          No hay promociones cargadas. Creá la primera con “Nueva”.
        </div>
      ) : (
        <>
          {/* MÓVIL — lista compacta */}
          <div className="sm:hidden space-y-2">
            {promos.map((p) => {
              const m = META[estadoPromo(p)];
              return (
                <button
                  key={p.id}
                  onClick={() => openEdit(p)}
                  className="w-full flex items-center gap-3 p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 text-left transition"
                >
                  <div className="w-16 h-11 rounded bg-neutral-800 flex-none overflow-hidden flex items-center justify-center">
                    {p.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo_url} alt="" className="max-h-8 max-w-[90%] object-contain" />
                    ) : p.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagen_url} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{p.titulo}</p>
                    <p className="text-xs text-neutral-500 truncate">{p.entidad || p.descripcion || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-none">
                    <span className={`text-[10px] flex items-center gap-1 ${m.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} /> {m.txt}
                    </span>
                    <span className="text-neutral-600 text-[10px]">Prioridad {p.prioridad}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* DESKTOP — grilla con la card real del home */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((p) => {
              const m = META[estadoPromo(p)];
              return (
                <button
                  key={p.id}
                  onClick={() => openEdit(p)}
                  className="group text-left relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-sm p-1"
                >
                  <PromoCard promo={p} preview />
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className={`text-[11px] font-medium flex items-center gap-1.5 ${m.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} /> {m.txt}
                    </span>
                    <span className="text-neutral-600 text-[11px]">Prioridad {p.prioridad}</span>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                    Editar
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <PromoDrawer
        key={editing?.id ?? "new"}
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEditing(undefined); }}
        promoToEdit={editing}
      />
    </div>
  );
}