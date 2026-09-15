// src/components/admin/ListaEditor.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { updateLista } from "@/actions/site-content";
import Button from "@/components/ui/Button";

export default function ListaEditor({ clave, initial, label }: { clave: string; initial: string[]; label: string }) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(initial ?? []);
  const [nuevo, setNuevo] = useState("");
  const [saving, setSaving] = useState(false);

  const agregar = () => {
    const v = nuevo.trim();
    if (!v) return;
    if (items.length >= 12) { toast.error("Máximo 12 ítems"); return; }
    setItems((p) => [...p, v]);
    setNuevo("");
  };
  const quitar = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));

  const guardar = async () => {
    setSaving(true);
    try {
      const res = await updateLista(clave, items);
      if (res.success) { toast.success("Lista actualizada"); router.refresh(); }
      else toast.error(res.error || "No se pudo guardar");
    } catch (e) { console.error(e); toast.error("Error de conexión."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 bg-neutral-800 text-white text-xs px-2.5 py-1 rounded-full">
            {it}
            <button onClick={() => quitar(i)} className="text-neutral-400 hover:text-red-400" aria-label={`Quitar ${it}`}><X size={12} /></button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-neutral-600">Sin ítems.</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
          placeholder="Agregar ítem…"
          maxLength={40}
          className="flex-1 bg-neutral-900 border border-neutral-800 text-white p-2 rounded text-sm outline-none focus:border-brand-red"
        />
        <button onClick={agregar} disabled={items.length >= 12} className="px-3 bg-neutral-800 text-white rounded disabled:opacity-40" aria-label="Agregar"><Plus size={16} /></button>
      </div>
      <div className="flex justify-end">
        <Button onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar lista"}</Button>
      </div>
    </div>
  );
}