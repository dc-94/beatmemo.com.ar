// src/components/admin/PromocionesClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, EyeOff, Calendar, Landmark, Tag } from "lucide-react";
import PromoDrawer from "./PromoDrawer";

interface Promo {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  entidad: string | null;
  logo_url: string | null;
  dias_semana: number[] | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
  activo: boolean;
  prioridad: number;
}

const TIPO_META: Record<string, { label: string; Icon: any }> = {
  banco: { label: "Banco", Icon: Landmark },
  fecha_especial: { label: "Fecha", Icon: Calendar },
  local: { label: "Local", Icon: Tag },
};

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
          <p className="text-neutral-400 text-sm">{promos.length} promos · se muestran en la barra del home</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm">
          <Plus size={18} /> Nueva promo
        </button>
      </header>

      {promos.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          No hay promociones cargadas. Creá la primera con “Nueva promo”.
        </div>
      ) : (
        <div className="space-y-2">
          {promos.map((p) => {
            const meta = TIPO_META[p.tipo] ?? TIPO_META.local;
            const Icon = meta.Icon;
            return (
              <button key={p.id} onClick={() => openEdit(p)}
                className="w-full text-left flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                <div className="w-16 h-10 shrink-0 bg-neutral-950 rounded flex items-center justify-center overflow-hidden">
                  {p.logo_url ? (
                    <Image src={p.logo_url} alt={p.entidad ?? p.titulo} width={60} height={36} className="object-contain" />
                  ) : (
                    <Icon size={18} className="text-neutral-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white truncate">
                      {p.entidad ? `${p.entidad} — ` : ""}{p.titulo}
                    </h3>
                    {!p.activo && (
                      <span className="bg-neutral-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <EyeOff size={10} /> Inactiva
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5 flex items-center gap-1">
                    <Icon size={11} /> {meta.label} · prioridad {p.prioridad}
                    {p.dias_semana?.length ? ` · ${p.dias_semana.length} día(s)` : ""}
                  </p>
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