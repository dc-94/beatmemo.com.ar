// src/components/admin/RooftopGaleriaClient.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import CloudinaryWidget from "./CloudinaryWidget";
import { updateSeccionRooftop } from "@/actions/rooftop-servicios";   // reusa el upsert de encabezado
import { upsertGaleria, deleteGaleria, reorderGaleria } from "@/actions/rooftop-galeria";

export interface Foto { id: string; imagen_url: string; subtitulo: string | null; ancho: number; alto: number; orden: number; activo: boolean; }
export interface SeccionRooftop { clave: string; titulo: string; subtitulo: string; cuerpo: string; imagen_url: string; }

export default function RooftopGaleriaClient({ seccion, fotos: iniciales }: { seccion: SeccionRooftop | null; fotos: Foto[] }) {
  const [titulo, setTitulo] = useState(seccion?.titulo ?? "");
  const [subtitulo, setSubtitulo] = useState(seccion?.subtitulo ?? "");
  const [guardandoSeccion, setGuardandoSeccion] = useState(false);

  const [fotos, setFotos] = useState<Foto[]>(iniciales);
  const [borrar, setBorrar] = useState<Foto | null>(null);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => { setFotos(iniciales); }, [iniciales]);

  const guardarSeccion = async () => {
    setGuardandoSeccion(true);
    const fd = new FormData();
    fd.set("clave", "descubri"); fd.set("titulo", titulo); fd.set("subtitulo", subtitulo);
    const res = await updateSeccionRooftop(fd);
    setGuardandoSeccion(false);
    if (res.success) toast.success("Encabezado guardado");
    else toast.error(res.error ?? "No se pudo guardar");
  };

  const fd = (f: Foto) => {
    const form = new FormData();
    form.set("id", f.id); form.set("imagen_url", f.imagen_url); form.set("subtitulo", f.subtitulo ?? "");
    form.set("ancho", String(f.ancho)); form.set("alto", String(f.alto));
    form.set("orden", String(f.orden)); form.set("activo", f.activo ? "true" : "false");
    return form;
  };

  const onUpload = async (info: { url: string; width: number; height: number }) => {
    const form = new FormData();
    form.set("imagen_url", info.url); form.set("ancho", String(info.width)); form.set("alto", String(info.height));
    form.set("orden", String(fotos.length)); form.set("activo", "true");
    const res = await upsertGaleria(form);
    if (res.success && res.newId) {
      setFotos((p) => [...p, { id: res.newId!, imagen_url: info.url, subtitulo: "", ancho: info.width, alto: info.height, orden: p.length, activo: true }]);
      toast.success("Foto agregada");
    } else toast.error(res.error ?? "No se pudo guardar");
  };

  const guardarSubtitulo = async (f: Foto, val: string) => {
    if ((f.subtitulo ?? "") === val) return;
    const nuevo = { ...f, subtitulo: val };
    setFotos((p) => p.map((x) => (x.id === f.id ? nuevo : x)));
    const res = await upsertGaleria(fd(nuevo));
    if (res.success) toast.success("Guardado");
    else { setFotos((p) => p.map((x) => (x.id === f.id ? f : x))); toast.error(res.error ?? "No se pudo guardar"); }
  };

  const toggle = async (f: Foto) => {
    const nuevo = { ...f, activo: !f.activo };
    setFotos((p) => p.map((x) => (x.id === f.id ? nuevo : x)));
    const res = await upsertGaleria(fd(nuevo));
    if (!res.success) { setFotos((p) => p.map((x) => (x.id === f.id ? f : x))); toast.error(res.error ?? "No se pudo actualizar"); }
  };

  const mover = async (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= fotos.length) return;
    const previo = fotos;
    const copia = [...fotos]; [copia[i], copia[j]] = [copia[j], copia[i]];
    const conOrden = copia.map((f, idx) => ({ ...f, orden: idx }));
    setFotos(conOrden);
    const res = await reorderGaleria(conOrden.map(({ id, orden }) => ({ id, orden })));
    if (!res.success) { setFotos(previo); toast.error(res.error ?? "No se pudo reordenar"); }
  };

  const confirmarBorrado = async () => {
    if (!borrar) return;
    setBorrando(true);
    const res = await deleteGaleria(borrar.id);
    setBorrando(false);
    if (res.success) { setFotos((p) => p.filter((x) => x.id !== borrar.id)); toast.success("Foto eliminada"); setBorrar(null); }
    else toast.error(res.error ?? "No se pudo eliminar");
  };

  const aspecto = (f: Foto) =>
    f.ancho && f.alto ? (f.ancho / f.alto >= 1.3 ? "ancha" : f.alto / f.ancho >= 1.3 ? "alta" : "cuadrada") : "—";

  const inputCls = "w-full bg-neutral-950 border border-neutral-800 text-white p-2 rounded text-sm focus:border-brand-red outline-none";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Descubrí Rooftop</h2>
        <p className="text-neutral-500 text-xs mt-1">Encabezado + galería bento (se ordena sola por la forma de cada foto).</p>
      </div>

      {/* Encabezado */}
      <div className="space-y-3 border border-neutral-800 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Encabezado</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Eyebrow</label>
            <input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} placeholder="El espacio" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Descubrí el rooftop" className={inputCls} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={guardarSeccion} disabled={guardandoSeccion}>{guardandoSeccion ? "Guardando…" : "Guardar encabezado"}</Button>
        </div>
      </div>

      {/* Galería */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Fotos ({fotos.length})</p>
          <CloudinaryWidget folder="beatmemo/rooftop/secciones" label="Subir foto" variant="primary" onUpload={onUpload} />
        </div>
        {fotos.length === 0 && <p className="text-neutral-600 text-sm">Sin fotos. Subí la primera.</p>}
        <ul className="space-y-2">
          {fotos.map((f, i) => (
            <li key={f.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.imagen_url} alt="" className="h-12 w-16 object-cover rounded shrink-0" />
              <div className="flex-1 min-w-0">
                <input defaultValue={f.subtitulo ?? ""} onBlur={(e) => guardarSubtitulo(f, e.target.value.trim())} placeholder="Subtítulo (opcional)" className={inputCls} />
                <p className="text-neutral-600 text-[11px] mt-1">{f.ancho}×{f.alto} · {aspecto(f)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => toggle(f)} className="p-1 text-neutral-400 hover:text-white" title={f.activo ? "Ocultar" : "Mostrar"}>
                  {f.activo ? <Eye size={15} /> : <EyeOff size={15} className="text-neutral-600" />}
                </button>
                <button type="button" onClick={() => setBorrar(f)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={!!borrar} danger loading={borrando}
        title="Eliminar foto"
        message="La foto deja de mostrarse en la galería del rooftop."
        confirmLabel="Eliminar"
        onConfirm={confirmarBorrado}
        onCancel={() => { if (!borrando) setBorrar(null); }}
      />
    </div>
  );
}