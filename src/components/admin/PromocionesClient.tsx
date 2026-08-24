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

export default function PromocionesClient({ promos }: { promos: Promo[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | undefined>(undefined);

  const openNew = () => { setEditing(undefined); setIsOpen(true); };
  const openEdit = (p: Promo) => { setEditing(p); setIsOpen(true); };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Promociones</h1>
          <p className="text-neutral-400 text-sm">{promos.length} promos · así se ven en el home</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> Nuevo item
        </Button>
      </header>

      {promos.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          No hay promociones cargadas. Creá la primera con “Nueva promo”.
        </div>
      ) : (
        // 3 columnas en desktop: el ancho menor hace la card más chica y
        // fiel al tamaño del home. gap-6 separa para que no se pisen.
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((p) => {
            const est = estadoPromo(p);
            const META = {
              vigente:    { txt: "Vigente hoy", color: "text-green-500",   dot: "bg-green-500" },
              programada: { txt: "Programada",  color: "text-amber-500",   dot: "bg-amber-500" },
              vencida:    { txt: "Vencida",     color: "text-red-500",     dot: "bg-red-500" },
              inactiva:   { txt: "Inactiva",    color: "text-neutral-500", dot: "bg-neutral-500" },
            }[est];

            return (
              <button
                key={p.id}
                onClick={() => openEdit(p)}
                className="group text-left relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-sm p-1"
              >
                {/* La MISMA PromoCard del home. aspect-[16/10] la mantiene fiel. */}
                <PromoCard promo={p} preview />

                {/* Metadata admin: afuera de la card, no la altera. */}
                <div className="mt-3 flex items-center justify-between px-1">
                  <span className={`text-[11px] font-medium flex items-center gap-1.5 ${META.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${META.dot}`} />
                    {META.txt}
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