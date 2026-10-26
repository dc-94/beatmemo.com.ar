// src/components/admin/RooftopServiciosClient.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Eye, EyeOff, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import CloudinaryWidget from "./CloudinaryWidget";
import { updateSeccionRooftop, upsertServicio, deleteServicio, reorderServicios } from "@/actions/rooftop-servicios";

export interface Servicio { id: string; texto: string; detalle: string | null; orden: number; activo: boolean; }
export interface SeccionRooftop { clave: string; titulo: string; subtitulo: string; cuerpo: string; imagen_url: string; }

export default function RooftopServiciosClient({ seccion, servicios: iniciales }: { seccion: SeccionRooftop | null; servicios: Servicio[] }) {
  // encabezado
  const [titulo, setTitulo] = useState(seccion?.titulo ?? "");
  const [subtitulo, setSubtitulo] = useState(seccion?.subtitulo ?? "");
  const [imagenUrl, setImagenUrl] = useState(seccion?.imagen_url ?? "");
  const [guardandoSeccion, setGuardandoSeccion] = useState(false);

  // lista
  const [servicios, setServicios] = useState<Servicio[]>(iniciales);
  const [borrar, setBorrar] = useState<Servicio | null>(null);
  const [borrando, setBorrando] = useState(false);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [nuevoDetalle, setNuevoDetalle] = useState("");

  useEffect(() => { setServicios(iniciales); }, [iniciales]);

  const guardarSeccion = async () => {
    setGuardandoSeccion(true);
    const fd = new FormData();
    fd.set("clave", "servicios");
    fd.set("titulo", titulo);
    fd.set("subtitulo", subtitulo);
    fd.set("imagen_url", imagenUrl);
    const res = await updateSeccionRooftop(fd);
    setGuardandoSeccion(false);
    if (res.success) toast.success("Encabezado guardado");
    else toast.error(res.error ?? "No se pudo guardar");
  };

  const fd = (s: Servicio) => {
    const f = new FormData();
    f.set("id", s.id); f.set("texto", s.texto); f.set("detalle", s.detalle ?? "");
    f.set("orden", String(s.orden)); f.set("activo", s.activo ? "true" : "false");
    return f;
  };

  const agregar = async () => {
    const texto = nuevoTexto.trim();
    if (!texto) return;
    const f = new FormData();
    f.set("texto", texto); f.set("detalle", nuevoDetalle.trim());
    f.set("orden", String(servicios.length)); f.set("activo", "true");
    const res = await upsertServicio(f);
    if (res.success && res.newId) {
      setServicios((p) => [...p, { id: res.newId!, texto, detalle: nuevoDetalle.trim(), orden: p.length, activo: true }]);
      setNuevoTexto(""); setNuevoDetalle(""); toast.success("Servicio agregado");
    } else toast.error(res.error ?? "No se pudo agregar");
  };

  const guardarCampo = async (s: Servicio, campo: "texto" | "detalle", val: string) => {
    if ((s[campo] ?? "") === val) return;
    const nuevo = { ...s, [campo]: val };
    setServicios((p) => p.map((x) => (x.id === s.id ? nuevo : x)));
    const res = await upsertServicio(fd(nuevo));
    if (res.success) toast.success("Guardado");
    else { setServicios((p) => p.map((x) => (x.id === s.id ? s : x))); toast.error(res.error ?? "No se pudo guardar"); }
  };

  const toggle = async (s: Servicio) => {
    const nuevo = { ...s, activo: !s.activo };
    setServicios((p) => p.map((x) => (x.id === s.id ? nuevo : x)));
    const res = await upsertServicio(fd(nuevo));
    if (!res.success) { setServicios((p) => p.map((x) => (x.id === s.id ? s : x))); toast.error(res.error ?? "No se pudo actualizar"); }
  };

  const mover = async (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= servicios.length) return;
    const previo = servicios;
    const copia = [...servicios]; [copia[i], copia[j]] = [copia[j], copia[i]];
    const conOrden = copia.map((s, idx) => ({ ...s, orden: idx }));
    setServicios(conOrden);
    const res = await reorderServicios(conOrden.map(({ id, orden }) => ({ id, orden })));
    if (!res.success) { setServicios(previo); toast.error(res.error ?? "No se pudo reordenar"); }
  };

  const confirmarBorrado = async () => {
    if (!borrar) return;
    setBorrando(true);
    const res = await deleteServicio(borrar.id);
    setBorrando(false);
    if (res.success) { setServicios((p) => p.filter((x) => x.id !== borrar.id)); toast.success("Servicio eliminado"); setBorrar(null); }
    else toast.error(res.error ?? "No se pudo eliminar");
  };

  const inputCls = "w-full bg-neutral-950 border border-neutral-800 text-white p-2 rounded text-sm focus:border-brand-red outline-none";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Servicios</h2>
        <p className="text-neutral-500 text-xs mt-1">Encabezado de la sección + la lista de “qué incluye”.</p>
      </div>

      {/* Encabezado */}
      <div className="space-y-3 border border-neutral-800 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Encabezado</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Eyebrow (arriba)</label>
            <input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} placeholder="Todo incluido" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Servicios" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Imagen (B&N, vertical 4:5)</label>
          {imagenUrl ? (
            <div className="flex items-center gap-3 p-2 bg-neutral-950 border border-neutral-800 rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagenUrl} alt="" className="h-14 w-12 object-cover rounded grayscale" />
              <span className="text-green-500 text-xs flex-1">✓ Cargada</span>
              <button type="button" onClick={() => setImagenUrl("")} className="text-red-500 text-xs font-semibold px-2 py-1">Quitar</button>
            </div>
          ) : (
            <CloudinaryWidget folder="beatmemo/rooftop/secciones" label="Subir imagen" onSuccess={setImagenUrl} />
          )}
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={guardarSeccion} disabled={guardandoSeccion}>{guardandoSeccion ? "Guardando…" : "Guardar encabezado"}</Button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Qué incluye</p>
        <ul className="space-y-2">
          {servicios.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded p-2">
              <input defaultValue={s.texto} onBlur={(e) => guardarCampo(s, "texto", e.target.value.trim())} placeholder="Servicio" className={`${inputCls} flex-1 min-w-0`} />
              <input defaultValue={s.detalle ?? ""} onBlur={(e) => guardarCampo(s, "detalle", e.target.value.trim())} placeholder="detalle (gris)" className={`${inputCls} flex-1 min-w-0 text-neutral-400`} />
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === servicios.length - 1} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => toggle(s)} className="p-1 text-neutral-400 hover:text-white" title={s.activo ? "Ocultar" : "Mostrar"}>
                  {s.activo ? <Eye size={15} /> : <EyeOff size={15} className="text-neutral-600" />}
                </button>
                <button type="button" onClick={() => setBorrar(s)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
        {servicios.length === 0 && <p className="text-neutral-600 text-sm">Sin servicios. Agregá el primero.</p>}

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center pt-1">
          <input value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") agregar(); }} placeholder="Nuevo servicio" className={`${inputCls} flex-1`} />
          <input value={nuevoDetalle} onChange={(e) => setNuevoDetalle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") agregar(); }} placeholder="detalle (opcional)" className={`${inputCls} flex-1`} />
          <Button size="sm" onClick={agregar} className="shrink-0"><Plus size={16} /> Agregar</Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!borrar} danger loading={borrando}
        title="Eliminar servicio"
        message={`¿Eliminar “${borrar?.texto}”? Deja de mostrarse en la lista.`}
        confirmLabel="Eliminar"
        onConfirm={confirmarBorrado}
        onCancel={() => { if (!borrando) setBorrar(null); }}
      />
    </div>
  );
}