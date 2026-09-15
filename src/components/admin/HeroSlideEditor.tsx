// src/components/admin/HeroSlideEditor.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import CloudinaryWidget from "./CloudinaryWidget";
import { updateHeroSlides } from "@/actions/site-content";
import Button from "@/components/ui/Button";

interface Slide { imagen: string; palabra: string; }

export default function HeroSlidesEditor({ initial }: { initial: Slide[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>(initial.length ? initial : []);
  const [saving, setSaving] = useState(false);

  const setSlide = (i: number, patch: Partial<Slide>) =>
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const add = () => {
    if (slides.length >= 4) { toast.error("Máximo 4 slides"); return; }
    setSlides((prev) => [...prev, { imagen: "", palabra: "" }]);
  };
  const remove = (i: number) => setSlides((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const guardar = async () => {
    // Validación de UX antes de mandar (el server revalida igual).
    if (slides.length === 0) { toast.error("Agregá al menos 1 slide"); return; }
    for (const [i, s] of slides.entries()) {
      if (!s.imagen) { toast.error(`El slide ${i + 1} no tiene imagen`); return; }
      if (!s.palabra.trim()) { toast.error(`El slide ${i + 1} no tiene palabra`); return; }
    }
    setSaving(true);
    try {
      const res = await updateHeroSlides(slides);
      if (res.success) { toast.success("Portada actualizada"); router.refresh(); }
      else toast.error(res.error || "No se pudo guardar");
    } catch (e) { console.error(e); toast.error("Error de conexión."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Cada slide es una imagen + la palabra que la acompaña. Se muestran rotando en la portada. Máximo 4.
        </p>
        <span className="text-xs text-neutral-500">{slides.length}/4</span>
      </div>

      <div className="space-y-3">
        {slides.map((s, i) => (
          <div key={i} className="flex gap-3 items-start p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            {/* Reordenar */}
            <div className="flex flex-col gap-1 pt-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-neutral-500 hover:text-white disabled:opacity-20 p-0.5" aria-label="Subir"><ArrowUp size={15} /></button>
              <span className="text-[10px] text-center text-neutral-600 font-mono">{i + 1}</span>
              <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="text-neutral-500 hover:text-white disabled:opacity-20 p-0.5" aria-label="Bajar"><ArrowDown size={15} /></button>
            </div>

            {/* Imagen */}
            <div className="w-28 shrink-0">
              {s.imagen ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imagen} alt="" className="w-28 h-20 object-cover rounded" />
                  <button onClick={() => setSlide(i, { imagen: "" })} className="absolute top-1 right-1 bg-black/70 text-red-400 rounded p-0.5" aria-label="Quitar imagen"><Trash2 size={12} /></button>
                </div>
              ) : (
                <CloudinaryWidget folder="beatmemo/hero" label="Imagen" onSuccess={(url) => setSlide(i, { imagen: url })} />
              )}
            </div>

            {/* Palabra */}
            <div className="flex-1">
              <label className="block text-xs text-neutral-500 mb-1">Palabra</label>
              <input
                value={s.palabra}
                onChange={(e) => setSlide(i, { palabra: e.target.value })}
                placeholder="el pub"
                maxLength={30}
                className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 rounded text-sm outline-none focus:border-brand-red"
              />
              <p className="text-[10px] text-neutral-600 mt-1">Aparece como “Descubrí <span className="text-neutral-400">{s.palabra || "…"}</span>”</p>
            </div>

            {/* Borrar slide */}
            <button onClick={() => remove(i)} className="text-neutral-500 hover:text-red-400 p-1 mt-5" aria-label="Eliminar slide"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={add} disabled={slides.length >= 4} className="inline-flex items-center gap-1.5 text-sm text-brand-gold hover:text-brand-gold/80 disabled:opacity-40">
          <Plus size={15} /> Agregar slide
        </button>
        <Button onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar portada"}</Button>
      </div>
    </div>
  );
}