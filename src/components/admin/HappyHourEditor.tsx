// src/components/admin/HappyHourEditor.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import CloudinaryWidget from "./CloudinaryWidget";
import { updateLista, updateSiteContent } from "@/actions/site-content";
import type { SiteContent } from "@/lib/site-content";
import Button from "@/components/ui/Button";

export default function HappyHourEditor({ hh }: { hh: SiteContent | null }) {
  const router = useRouter();
  const [subtitulo, setSubtitulo] = useState(hh?.subtitulo ?? "");
  const [titulo, setTitulo] = useState(hh?.titulo ?? "");
  const [cuerpo, setCuerpo] = useState(hh?.cuerpo ?? "");
  const [imagen, setImagen] = useState(hh?.imagen_url ?? "");
  const [items, setItems] = useState<string[]>(hh?.lista ?? []);
  const [nuevo, setNuevo] = useState("");
  const [saving, setSaving] = useState(false);

  const agregar = () => {
    const v = nuevo.trim();
    if (!v) return;
    if (items.length >= 12) { toast.error("Máximo 12 ítems"); return; }
    setItems((p) => [...p, v]); setNuevo("");
  };
  const quitar = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));

  const guardar = async () => {
    setSaving(true);
    try {
      // Textos + imagen (form genérico de site_content) y la lista (aparte).
      const fd = new FormData();
      fd.set("clave", "pub_hh");
      fd.set("subtitulo", subtitulo);
      fd.set("titulo", titulo);
      fd.set("cuerpo", cuerpo);
      fd.set("imagen_url", imagen);

      const [r1, r2] = await Promise.all([
        updateSiteContent(fd),
        updateLista("pub_hh", items),
      ]);
      if (r1.success && r2.success) { toast.success("Happy Hour actualizado"); router.refresh(); }
      else toast.error(r1.error || r2.error || "No se pudo guardar");
    } catch (e) { console.error(e); toast.error("Error de conexión."); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-sm outline-none focus:border-brand-red";

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Horario (subtítulo)</label>
          <input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} placeholder="Todos los días · 18:30 a 21" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Título</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Casi toda la barra, más barata" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Descripción</label>
        <textarea value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} rows={2} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Foto</label>
        {imagen ? (
          <div className="flex items-center gap-3 p-2 bg-neutral-950 border border-neutral-800 rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagen} alt="" className="h-12 w-20 object-cover rounded" />
            <span className="text-green-500 text-xs flex-1">✓ Cargada</span>
            <button type="button" onClick={() => setImagen("")} className="text-red-500 text-xs font-semibold px-2 py-1">Quitar</button>
          </div>
        ) : (
          <CloudinaryWidget folder="beatmemo/pub" label="Subir foto" onSuccess={(url) => setImagen(url)} />
        )}
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Qué entra en el Happy Hour</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((it, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-neutral-800 text-white text-xs px-2.5 py-1 rounded-full">
              {it}
              <button onClick={() => quitar(i)} className="text-neutral-400 hover:text-red-400" aria-label={`Quitar ${it}`}><X size={12} /></button>
            </span>
          ))}
          {items.length === 0 && <span className="text-xs text-neutral-600">Sin ítems.</span>}
        </div>
        <div className="flex gap-2">
          <input value={nuevo} onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
            placeholder="Agregar ítem…" maxLength={40} className={inputCls} />
          <button onClick={agregar} disabled={items.length >= 12} className="px-3 bg-neutral-800 text-white rounded disabled:opacity-40" aria-label="Agregar"><Plus size={16} /></button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar Happy Hour"}</Button>
      </div>
    </div>
  );
}