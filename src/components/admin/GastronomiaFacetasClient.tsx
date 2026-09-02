// src/components/admin/GastronomiaFacetasClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Star } from "lucide-react";
import PubDrawer from "./PubDrawer";
import { getOptimizedImageUrl } from "@/lib/utils";
import Button from "@/components/ui/Button";

const FACETA_LABEL: Record<string, string> = {
  cafe: "Café y meriendas",
  ejecutivo: "Menú ejecutivo",
  cocina: "La cocina",
  variedad: "Variedades",
  barra_autor: "Barra de autor",
};

// El orden en que aparecen las facetas en la página real.
const FACETA_ORDEN = ["cafe", "ejecutivo", "cocina", "variedad", "barra_autor"];

interface Props {
  items: any[];
  categorias: string[];
}

export default function GastronomiaFacetasClient({ items, categorias }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(undefined);

  const openNew = () => { setEditing(undefined); setIsOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setIsOpen(true); };

  const porFaceta = items.reduce((acc, item) => {
    (acc[item.faceta] ??= []).push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Gastronomía · Facetas de /pub</h1>
          <p className="text-neutral-400 text-sm">{items.length} items distribuidos en las secciones de la página</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> Nuevo item
        </Button>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          Ningún item tiene faceta asignada todavía. Creá uno o asigná la faceta desde un plato existente.
        </div>
      ) : (
        FACETA_ORDEN.filter(f => porFaceta[f]?.length).map((faceta) => (
          <section key={faceta}>
            <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold mb-3">
              {FACETA_LABEL[faceta]} <span className="text-neutral-600">· {porFaceta[faceta].length}</span>
            </h2>
                        {/* MÓVIL — filas compactas */}
            <div className="md:hidden space-y-2">
              {porFaceta[faceta].map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => openEdit(item)}
                  className="w-full flex items-center gap-3 p-2.5 bg-neutral-900 border border-white/10 rounded-lg hover:bg-white/5 text-left transition"
                >
                  <div
                    className="w-14 h-14 rounded-md flex-none bg-neutral-800 bg-cover bg-center"
                    style={item.url_imagen ? { backgroundImage: `url(${getOptimizedImageUrl(item.url_imagen, 120, 120)})` } : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase tracking-wider text-neutral-500 truncate">{item.categoria}</span>
                    <p className="text-sm font-semibold text-white truncate">{item.nombre}</p>
                    {item.destacado_home && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-500/90 text-black font-bold px-1.5 rounded-full mt-1">
                        <Star size={9} /> Home
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
              {porFaceta[faceta].map((item: any) => (
                <button key={item.id} onClick={() => openEdit(item)}
                  className="text-left bg-neutral-900 border border-white/10 rounded-lg overflow-hidden hover:bg-white/5 transition">
                  <div className="relative aspect-[16/9] bg-neutral-800">
                    {item.url_imagen && (
                      <Image src={getOptimizedImageUrl(item.url_imagen, 320, 180)} alt="" fill className="object-cover" sizes="320px" />
                    )}
                    {/* Sello ★ Home: indica que este ítem TAMBIÉN sale en el home.
                        Así ves de un vistazo que es la misma fila en las dos vistas. */}
                    {item.destacado_home && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        <Star size={10} /> Home
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{item.nombre}</p>
                    {item.faceta === "barra_autor" && item.ingredientes?.length > 0 && (
                      <p className="text-neutral-500 text-xs truncate">{item.ingredientes.join(" · ")}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))
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