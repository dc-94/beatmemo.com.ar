// src/components/admin/CiclosManager.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Check, X } from "lucide-react";
import { upsertCiclo, deleteCiclo } from "@/actions/ciclos";
import { TIPOS_CICLO } from "@/lib/validations/ciclos";

interface Ciclo { id: string; nombre: string; tipo: string; }

const TIPO_LABEL: Record<string, string> = {
  SHOW: "Show / Concierto",
  EVENTO_CULTURAL: "Evento Cultural",
};

interface Props {
  ciclos: Ciclo[];
  // El padre (ShowsClient) es el dueño del estado. El manager le avisa qué cambió.
  onCiclosChange: (ciclos: Ciclo[]) => void;
}

export default function CiclosManager({ ciclos, onCiclosChange }: Props) {
  const [editando, setEditando] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<string>("SHOW");
  const [guardando, setGuardando] = useState(false);

  const abrirNuevo = () => { setEditando("new"); setNombre(""); setTipo("SHOW"); };
  const abrirEditar = (c: Ciclo) => { setEditando(c.id); setNombre(c.nombre); setTipo(c.tipo); };
  const cancelar = () => { setEditando(null); setNombre(""); };

  const guardar = async () => {
    if (!nombre.trim()) { toast.error("Poné un nombre"); return; }
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.set("nombre", nombre.trim());
      fd.set("tipo", tipo);
      const esNuevo = editando === "new";
      if (!esNuevo && editando) fd.set("id", editando);

      const res = await upsertCiclo(fd);
      if (res.success) {
        toast.success(esNuevo ? "Ciclo creado" : "Ciclo actualizado");
        // Actualizamos el estado del padre según lo que pasó.
        if (esNuevo && res.newId) {
          onCiclosChange([...ciclos, { id: res.newId, nombre: nombre.trim(), tipo }]);
        } else if (!esNuevo && editando) {
          onCiclosChange(ciclos.map((c) => c.id === editando ? { ...c, nombre: nombre.trim(), tipo } : c));
        }
        cancelar();
      } else {
        toast.error(res.error || "No se pudo guardar");
      }
    } catch (e) {
      console.error("[CiclosManager]", e);
      toast.error("Error de conexión.");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (c: Ciclo) => {
    if (!window.confirm(`¿Eliminar el ciclo "${c.nombre}"?`)) return;
    try {
      const res = await deleteCiclo(c.id);
      if (res.success) {
        toast.success("Ciclo eliminado");
        onCiclosChange(ciclos.filter((x) => x.id !== c.id));
      } else {
        toast.error(res.error || "No se pudo eliminar");
      }
    } catch (e) {
      console.error("[CiclosManager delete]", e);
      toast.error("Error de conexión.");
    }
  };

  const porTipo = ciclos.reduce((acc, c) => {
    (acc[c.tipo] ??= []).push(c);
    return acc;
  }, {} as Record<string, Ciclo[]>);

  const inputCls = "bg-neutral-900 border border-neutral-800 text-white p-2 rounded text-sm focus:border-brand-red outline-none";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-neutral-400 text-xs">Los ciclos agrupan shows y eventos culturales por su tipo.</p>
        {editando === null && (
          <button type="button" onClick={abrirNuevo} className="flex items-center gap-1 text-brand-gold text-xs font-semibold hover:text-brand-gold/80 shrink-0">
            <Plus size={14} /> Nuevo ciclo
          </button>
        )}
      </div>

      {editando !== null && (
        <div className="flex gap-2 items-center p-3 bg-neutral-900 border border-brand-gold/30 rounded">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del ciclo" className={`${inputCls} flex-1`} autoFocus />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
            {TIPOS_CICLO.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
          </select>
          <button type="button" onClick={guardar} disabled={guardando} className="text-green-500 hover:text-green-400 p-2 disabled:opacity-50"><Check size={18} /></button>
          <button type="button" onClick={cancelar} className="text-neutral-500 hover:text-neutral-300 p-2"><X size={18} /></button>
        </div>
      )}

      {Object.keys(porTipo).length === 0 && editando === null && (
        <p className="text-neutral-600 text-sm">No hay ciclos. Creá el primero.</p>
      )}
      {Object.entries(porTipo).map(([t, lista]) => (
        <div key={t}>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1.5">{TIPO_LABEL[t] ?? t}</p>
          <div className="space-y-1.5">
            {lista.map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-2.5 bg-neutral-900/50 border border-neutral-800 rounded group">
                <span className="flex-1 text-white text-sm">{c.nombre}</span>
                <button type="button" onClick={() => abrirEditar(c)} className="text-neutral-500 hover:text-white text-xs px-2 opacity-0 group-hover:opacity-100 transition">Editar</button>
                <button type="button" onClick={() => borrar(c)} className="text-red-500/70 hover:text-red-500 p-1"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}