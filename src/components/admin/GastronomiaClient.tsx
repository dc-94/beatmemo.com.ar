// src/components/admin/GastronomiaClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Star, EyeOff } from "lucide-react";
import PubDrawer from "./PubDrawer";
import { getOptimizedImageUrl } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface PubItem {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  url_imagen: string;
  tags: string[];
  es_vegetariano: boolean;
  es_vegano: boolean;
  es_sin_tacc: boolean;
  es_nuevo: boolean;
  es_recomendado: boolean;
  destacado_home: boolean;
  hero_destacado: boolean;
  disponible: boolean;
  orden: number;
}

interface Props {
  items: PubItem[];
  categorias: string[];
}

export default function GastronomiaClient({ items, categorias }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<PubItem | undefined>(undefined);

  const openNew = () => { setEditing(undefined); setIsOpen(true); };
  const openEdit = (item: PubItem) => { setEditing(item); setIsOpen(true); };

  return (
    <div className="space-y-6">
<header className="flex flex-col md:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gastronomía</h1>
          <p className="text-neutral-400 text-sm">{items.length} items en el menú</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> Nuevo item
        </Button>
      </header>
            {/* MÓVIL — filas compactas */}
          <div className="md:hidden space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => openEdit(item)}
                className="w-full flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-left transition"
              >
                <div
                  className="w-14 h-14 rounded-md flex-none bg-neutral-950 bg-cover bg-center"
                  style={item.url_imagen ? { backgroundImage: `url(${getOptimizedImageUrl(item.url_imagen, 120, 120)})` } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-500 truncate">{item.categoria}</span>
                  <p className="text-sm font-semibold text-white truncate">{item.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.destacado_home && <span className="text-[9px] bg-amber-500/90 text-black font-bold px-1.5 rounded-full">Home</span>}
                    {item.hero_destacado && <span className="text-[9px] bg-green-500/90 text-black font-bold px-1.5 rounded-full">Destacado</span>}
                    {!item.disponible && (
                      <span className="text-[9px] flex items-center gap-0.5 bg-neutral-700 text-white font-bold px-1.5 rounded-full">
                        <EyeOff size={9} /> Oculto
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
      {items.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          No hay items cargados. Creá el primero con “Nuevo item”.
        </div>
      ) : (
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => openEdit(item)}
              className="text-left bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition group"
            >
              <div className="relative aspect-video bg-neutral-950">
                {item.url_imagen && (
                  <Image
                    src={getOptimizedImageUrl(item.url_imagen, 400, 225)}
                    alt={item.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.destacado_home && (
                    <span className="bg-amber-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={10} /> Home
                    </span>
                  )}
                  {item.hero_destacado && <span className="bg-green-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      DESTACADO
                    </span>}
                  {!item.disponible && (
                    <span className="bg-neutral-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeOff size={10} /> Oculto
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">{item.categoria}</span>
                </div>
                <h3 className="font-semibold text-white">{item.nombre}</h3>
                {item.descripcion && (
                  <p className="text-neutral-400 text-xs mt-1 line-clamp-2">{item.descripcion}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <PubDrawer
        key={editing?.id ?? "new"}
        categorias={categorias}
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEditing(undefined); }}
        itemToEdit={editing}
      />
    </div>
  );
}