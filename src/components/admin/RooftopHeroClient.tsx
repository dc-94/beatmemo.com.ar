// src/components/admin/RooftopHeroClient.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import Button from "../ui/Button";
import CloudinaryWidget from "./CloudinaryWidget";
import { updateSeccionRooftop } from "@/actions/rooftop-servicios";

export interface SeccionHero {
  clave: string; titulo: string; subtitulo: string; cuerpo: string;
  cta_label: string; cta_url: string; imagenes: string[];
}

export default function RooftopHeroClient({ seccion }: { seccion: SeccionHero | null }) {
  const [titulo, setTitulo] = useState(seccion?.titulo ?? "");
  const [subtitulo, setSubtitulo] = useState(seccion?.subtitulo ?? "");
  const [cuerpo, setCuerpo] = useState(seccion?.cuerpo ?? "");
  const [ctaLabel, setCtaLabel] = useState(seccion?.cta_label ?? "");
  const [ctaUrl, setCtaUrl] = useState(seccion?.cta_url ?? "");
  const [imagenes, setImagenes] = useState<string[]>(seccion?.imagenes ?? []);
  const [guardando, setGuardando] = useState(false);

  const addImagen = (url: string) => {
    if (imagenes.length >= 6) { toast.error("Máximo 6 imágenes"); return; }
    setImagenes((p) => [...p, url]);
  };
  const removeImagen = (i: number) => setImagenes((p) => p.filter((_, idx) => idx !== i));
  const moveImagen = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= imagenes.length) return;
    setImagenes((p) => { const c = [...p]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  };

  const guardar = async () => {
    if (imagenes.length < 3) { toast.error("Subí al menos 3 imágenes"); return; }
    setGuardando(true);
    const fd = new FormData();
    fd.set("clave", "hero");
    fd.set("titulo", titulo);
    fd.set("subtitulo", subtitulo);
    fd.set("cuerpo", cuerpo);
    fd.set("cta_label", ctaLabel);
    fd.set("cta_url", ctaUrl);
    fd.set("imagenes", JSON.stringify(imagenes));
    const res = await updateSeccionRooftop(fd);
    setGuardando(false);
    if (res.success) toast.success("Hero guardado");
    else {
      toast.error(res.error ?? "No se pudo guardar");
      if (res.fieldErrors) Object.values(res.fieldErrors).flat().forEach((m) => m && toast.error(m as string));
    }
  };

  const inputCls = "w-full bg-neutral-950 border border-neutral-800 text-white p-2 rounded text-sm focus:border-brand-red outline-none";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Hero</h2>
        <p className="text-neutral-500 text-xs mt-1">Textos, botón y las 3–6 imágenes de fondo (se alternan con Ken Burns).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Eyebrow <span className="text-neutral-600">(opcional)</span></label>
          <input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Título</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Un nuevo espacio para tus eventos." className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-neutral-400 mb-1">Texto <span className="text-neutral-600">(opcional, bajo el título)</span></label>
        <textarea value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} rows={2} maxLength={2000} className={inputCls} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Texto del botón</label>
          <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Cotizá tu evento" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Link del botón</label>
          <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="#cotizar" className={inputCls} />
          <p className="text-neutral-600 text-[11px] mt-1">Interno <code>/</code>, ancla <code>#cotizar</code> o <code>https://</code></p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Imágenes de fondo <span className="text-neutral-600 normal-case tracking-normal">({imagenes.length}/6 · mín. 3)</span></label>
          {imagenes.length < 6 && (
            <CloudinaryWidget folder="beatmemo/rooftop/hero" label="Agregar" variant="primary" onSuccess={addImagen} />
          )}
        </div>
        {imagenes.length === 0 && <p className="text-neutral-600 text-xs">Subí entre 3 y 6 fotos a color, horizontales (se ven a pantalla completa).</p>}
        <ul className="space-y-2">
          {imagenes.map((url, i) => (
            <li key={`${url}-${i}`} className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-12 w-20 object-cover rounded shrink-0" />
              <span className="text-neutral-500 text-xs flex-1">Imagen {i + 1}</span>
              <button type="button" onClick={() => moveImagen(i, -1)} disabled={i === 0} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowUp size={15} /></button>
              <button type="button" onClick={() => moveImagen(i, 1)} disabled={i === imagenes.length - 1} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowDown size={15} /></button>
              <button type="button" onClick={() => removeImagen(i)} className="p-1 text-red-500 hover:text-red-400"><X size={15} /></button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : "Guardar hero"}</Button>
      </div>
    </div>
  );
}