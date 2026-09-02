// src/components/admin/EspacioClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, EyeOff } from "lucide-react";
import EspacioDrawer from "./EspacioDrawer";
import { getOptimizedImageUrl } from "@/lib/utils";
import Button from "../ui/Button";

export default function EspacioClient({ fotos }: { fotos: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(undefined);

  const abrir = (f?: any) => { setEditing(f); setIsOpen(true); };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Nuestro espacio</h1>
          <p className="text-neutral-400 text-sm">{fotos.length} fotos de la galería del bar</p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus size={18} /> Nueva Foto
        </Button>
      </header>

      {fotos.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          Todavía no hay fotos del espacio. Agregá la primera.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {fotos.map((f) => (
            <button key={f.id} onClick={() => abrir(f)}
              className="text-left bg-neutral-900 border border-white/10 rounded-lg overflow-hidden hover:bg-white/5 transition">
              <div className="relative aspect-[4/3] bg-neutral-800">
                <Image src={getOptimizedImageUrl(f.imagen_url, 400, 300)} alt="" fill className="object-cover" sizes="400px" />
                {!f.visible && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-neutral-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    <EyeOff size={10} /> Oculta
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-white text-sm font-medium truncate">{f.titulo || "Sin título"}</p>
                {f.epigrafe && <p className="text-neutral-500 text-xs truncate">{f.epigrafe}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <EspacioDrawer key={editing?.id ?? "new"} isOpen={isOpen} onClose={() => { setIsOpen(false); setEditing(undefined); }} fotoToEdit={editing} />
    </div>
  );
}