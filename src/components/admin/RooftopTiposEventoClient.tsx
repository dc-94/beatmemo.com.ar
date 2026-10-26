// src/components/admin/RooftopTiposEventoClient.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Eye, EyeOff, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import Button from "../ui/Button";
import TipoEventoDrawer from "./TipoEventoDrawer";
import { reorderTiposEvento, upsertTipoEvento } from "@/actions/rooftop-tipos-evento";

export interface TipoEvento {
  id: string;
  titulo_strong: string;
  titulo_light: string | null;
  descripcion: string | null;
  imagenes: string[];
  orden: number;
  activo: boolean;
}

export default function RooftopTiposEventoClient({ tipos: iniciales }: { tipos: TipoEvento[] }) {
  const [tipos, setTipos] = useState<TipoEvento[]>(iniciales);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<TipoEvento | undefined>(undefined);

  // Re-sincroniza cuando el server revalida (tras guardar/borrar en el drawer).
  useEffect(() => { setTipos(iniciales); }, [iniciales]);

  const abrir = (t?: TipoEvento) => { setEditing(t); setIsOpen(true); };
  const cerrar = () => { setIsOpen(false); setEditing(undefined); };

  const fd = (t: TipoEvento) => {
    const f = new FormData();
    f.set("id", t.id);
    f.set("titulo_strong", t.titulo_strong);
    f.set("titulo_light", t.titulo_light ?? "");
    f.set("descripcion", t.descripcion ?? "");
    f.set("imagenes", JSON.stringify(t.imagenes ?? []));
    f.set("orden", String(t.orden));
    f.set("activo", t.activo ? "true" : "false");
    return f;
  };

  const toggle = async (t: TipoEvento) => {
    const nuevo = { ...t, activo: !t.activo };
    setTipos((p) => p.map((x) => (x.id === t.id ? nuevo : x)));
    const res = await upsertTipoEvento(fd(nuevo));
    if (!res.success) { setTipos((p) => p.map((x) => (x.id === t.id ? t : x))); toast.error(res.error ?? "No se pudo actualizar"); }
  };

  const mover = async (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= tipos.length) return;
    const previo = tipos;
    const copia = [...tipos]; [copia[i], copia[j]] = [copia[j], copia[i]];
    const conOrden = copia.map((t, idx) => ({ ...t, orden: idx }));
    setTipos(conOrden);
    const res = await reorderTiposEvento(conOrden.map(({ id, orden }) => ({ id, orden })));
    if (!res.success) { setTipos(previo); toast.error(res.error ?? "No se pudo reordenar"); }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Tipos de evento</h2>
          <p className="text-neutral-500 text-xs mt-1 max-w-sm">Casamientos, 15, corporativos… cada uno con su carrusel de 3–6 fotos.</p>
        </div>
        <Button size="sm" onClick={() => abrir()}><Plus size={16} /> Nuevo tipo</Button>
      </header>

      {tipos.length === 0 && <p className="text-neutral-600 text-sm">Sin tipos de evento. Agregá el primero.</p>}

      <ul className="space-y-2">
        {tipos.map((t, i) => (
          <li key={t.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.imagenes?.[0]} alt="" className="h-11 w-16 object-cover rounded shrink-0 bg-neutral-800" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{t.titulo_strong}{t.titulo_light}</p>
              <p className="text-neutral-500 text-xs">{t.imagenes?.length ?? 0} fotos</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowUp size={16} /></button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === tipos.length - 1} className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowDown size={16} /></button>
              <button type="button" onClick={() => toggle(t)} className="p-1.5 text-neutral-400 hover:text-white" title={t.activo ? "Ocultar" : "Mostrar"}>
                {t.activo ? <Eye size={16} /> : <EyeOff size={16} className="text-neutral-600" />}
              </button>
              <button type="button" onClick={() => abrir(t)} className="p-1.5 text-neutral-400 hover:text-white"><Pencil size={16} /></button>
            </div>
          </li>
        ))}
      </ul>

      <TipoEventoDrawer key={editing?.id ?? "new"} isOpen={isOpen} onClose={cerrar} tipoToEdit={editing} />
    </div>
  );
}