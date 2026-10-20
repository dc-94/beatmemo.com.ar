// src/components/admin/RooftopMarcasClient.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { upsertMarca, deleteMarca, reorderMarcas } from "@/actions/rooftop-marcas";
import CloudinaryWidget from "@/components/admin/CloudinaryWidget";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export interface Marca {
  id: string;
  nombre: string | null;
  logo_url: string;
  orden: number;
  activo: boolean;
}

export default function RooftopMarcasClient({ marcas: iniciales }: { marcas: Marca[] }) {
  const [marcas, setMarcas] = useState<Marca[]>(iniciales);
  const [borrar, setBorrar] = useState<Marca | null>(null);
  const [borrando, setBorrando] = useState(false);

  // Arma el FormData que espera upsertMarca.
  const fd = (m: Partial<Marca>) => {
    const f = new FormData();
    if (m.id) f.set("id", m.id);
    if (m.logo_url != null) f.set("logo_url", m.logo_url);
    f.set("nombre", m.nombre ?? "");
    if (m.orden != null) f.set("orden", String(m.orden));
    f.set("activo", m.activo ? "true" : "false");
    return f;
  };

// Subir logo → insert. El cliente arma la fila con el newId que devuelve la action.
const onUpload = async (url: string) => {
  const nueva = { nombre: "", logo_url: url, orden: marcas.length, activo: true };
  const res = await upsertMarca(fd(nueva));
  if (res.success && res.newId) {
    setMarcas((p) => [...p, { id: res.newId!, ...nueva }]);
    toast.success("Logo agregado");
  } else toast.error(res.error ?? "No se pudo guardar");
};

  // Activar / ocultar (optimista + revertir si falla).
  const toggle = async (m: Marca) => {
    const nuevo = { ...m, activo: !m.activo };
    setMarcas((p) => p.map((x) => (x.id === m.id ? nuevo : x)));
    const res = await upsertMarca(fd(nuevo));
    if (!res.success) {
      setMarcas((p) => p.map((x) => (x.id === m.id ? m : x)));
      toast.error(res.error ?? "No se pudo actualizar");
    }
  };

  // Guardar nombre al salir del input.
  const saveNombre = async (m: Marca, nombre: string) => {
    const limpio = nombre.trim();
    if ((m.nombre ?? "") === limpio) return;
    const nuevo = { ...m, nombre: limpio };
    setMarcas((p) => p.map((x) => (x.id === m.id ? nuevo : x)));
    const res = await upsertMarca(fd(nuevo));
    if (res.success) toast.success("Nombre guardado");
    else toast.error(res.error ?? "No se pudo guardar");
  };

  // Reordenar con flechas (optimista + persistir el orden).
  const mover = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= marcas.length) return;
    const previo = marcas;
    const copia = [...marcas];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    const conOrden = copia.map((m, idx) => ({ ...m, orden: idx }));
    setMarcas(conOrden);
    const res = await reorderMarcas(conOrden.map(({ id, orden }) => ({ id, orden })));
    if (!res.success) {
      setMarcas(previo);
      toast.error(res.error ?? "No se pudo reordenar");
    }
  };

  // Borrar con ConfirmDialog (no window.confirm).
  const confirmarBorrado = async () => {
    if (!borrar) return;
    setBorrando(true);
    const res = await deleteMarca(borrar.id);
    setBorrando(false);
    if (res.success) {
      setMarcas((p) => p.filter((x) => x.id !== borrar.id));
      toast.success("Marca eliminada");
      setBorrar(null);
    } else toast.error(res.error ?? "No se pudo eliminar");
  };

    return (
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Marcas</h2>
          <p className="text-neutral-500 text-xs mt-1 leading-relaxed max-w-sm">
            PNG con fondo transparente · ancho ~400&nbsp;px · se muestran en blanco y negro y a alto uniforme.
          </p>
        </div>
        <CloudinaryWidget folder="beatmemo/rooftop/marcas" label="Subir logo" variant="primary" onSuccess={onUpload} />
      </header>

      {marcas.length === 0 && <p className="text-neutral-600 text-sm">Sin marcas. Subí el primer logo.</p>}

      <ul className="space-y-2">
        {/* …igual que antes… */}
        {marcas.map((m, i) => (
          <li key={m.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.logo_url} alt={m.nombre ?? ""} className="h-9 w-16 object-contain grayscale shrink-0" />
            <input
              defaultValue={m.nombre ?? ""}
              onBlur={(e) => saveNombre(m, e.target.value)}
              placeholder="Nombre (opcional)"
              className="flex-1 bg-neutral-950 border border-neutral-800 text-white p-2 rounded text-sm focus:border-brand-red outline-none min-w-0"
            />
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowUp size={16} /></button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === marcas.length - 1} className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowDown size={16} /></button>
              <button type="button" onClick={() => toggle(m)} className="p-1.5 text-neutral-400 hover:text-white" title={m.activo ? "Ocultar" : "Mostrar"}>
                {m.activo ? <Eye size={16} /> : <EyeOff size={16} className="text-neutral-600" />}
              </button>
              <button type="button" onClick={() => setBorrar(m)} className="p-1.5 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!borrar}
        danger
        title="Eliminar marca"
        message={`¿Eliminar ${borrar?.nombre || "este logo"}? No se muestra más en el rooftop.`}
        confirmLabel="Eliminar"
        loading={borrando}
        onConfirm={confirmarBorrado}
        onCancel={() => { if (!borrando) setBorrar(null); }}
      />
    </div>
  );
}