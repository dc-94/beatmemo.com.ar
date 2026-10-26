// src/components/admin/TipoEventoDrawer.tsx
"use client";

import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import CloudinaryWidget from "./CloudinaryWidget";
import ConfirmDialog from "../ui/ConfirmDialog";
import Button from "../ui/Button";
import { tipoEventoSchema } from "@/lib/validations/rooftop-tipos-evento";
import { upsertTipoEvento, deleteTipoEvento } from "@/actions/rooftop-tipos-evento";

export default function TipoEventoDrawer({ isOpen, onClose, tipoToEdit }: { isOpen: boolean; onClose: () => void; tipoToEdit?: any }) {
  const isEditing = !!tipoToEdit;
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const drawerRef = useDrawerA11y(isOpen, onClose);

  const defaults = () => ({
    titulo_strong: tipoToEdit?.titulo_strong ?? "",
    titulo_light:  tipoToEdit?.titulo_light ?? "",
    descripcion:   tipoToEdit?.descripcion ?? "",
    imagenes:      (tipoToEdit?.imagenes as string[]) ?? [],
    orden:         tipoToEdit?.orden ?? 0,
    activo:        tipoToEdit?.activo ?? true,
  });

  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors, isSubmitting } } =
    useForm<z.input<typeof tipoEventoSchema>, unknown, z.output<typeof tipoEventoSchema>>({
      resolver: zodResolver(tipoEventoSchema),
      defaultValues: defaults(),
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isOpen) reset(defaults()); }, [tipoToEdit, isOpen]);

  const imagenes: string[] = watch("imagenes") ?? [];
  if (!isOpen) return null;

  const addImagen = (url: string) => {
    if (imagenes.length >= 6) { toast.error("Máximo 6 imágenes"); return; }
    setValue("imagenes", [...imagenes, url], { shouldValidate: true });
  };
  const removeImagen = (i: number) => setValue("imagenes", imagenes.filter((_, idx) => idx !== i), { shouldValidate: true });
  const moveImagen = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= imagenes.length) return;
    const copia = [...imagenes]; [copia[i], copia[j]] = [copia[j], copia[i]];
    setValue("imagenes", copia, { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    try {
      const fd = new FormData();
      fd.append("titulo_strong", data.titulo_strong);
      fd.append("titulo_light", data.titulo_light ?? "");
      fd.append("descripcion", data.descripcion ?? "");
      fd.append("imagenes", JSON.stringify(data.imagenes ?? []));
      fd.append("orden", String(data.orden ?? 0));
      fd.append("activo", data.activo ? "true" : "false");
      if (isEditing) fd.append("id", tipoToEdit.id);

      const res = await upsertTipoEvento(fd);
      if (res.success) { toast.success(isEditing ? "Tipo actualizado" : "Tipo agregado"); onClose(); }
      else {
        if (res.fieldErrors) Object.entries(res.fieldErrors).forEach(([c, m]) => {
          const msg = Array.isArray(m) ? m[0] : m; if (msg) setError(c as any, { type: "server", message: msg });
        });
        toast.error(res.error || "Revisá los campos.");
      }
    } catch (e) { console.error("[TipoEventoDrawer]", e); toast.error("Error de conexión."); }
  };

  const confirmDelete = async () => {
    if (!tipoToEdit?.id) return;
    setIsDeleting(true);
    try {
      const res = await deleteTipoEvento(tipoToEdit.id);
      if (res.success) { toast.success("Tipo eliminado"); setConfirmOpen(false); onClose(); }
      else toast.error(res.error || "No se pudo eliminar");
    } catch (e) { console.error("[TipoEventoDrawer] delete:", e); toast.error("No se pudo eliminar."); }
    finally { setIsDeleting(false); }
  };

  const inputCls = "w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none text-sm";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-50 flex flex-col shadow-2xl" ref={drawerRef}>
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">{isEditing ? "Editar tipo de evento" : "Nuevo tipo de evento"}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="tipo-evento-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Título fuerte *</label>
                <input {...register("titulo_strong")} placeholder="Casa" className={inputCls} />
                {errors.titulo_strong && <p className="text-red-500 text-xs mt-1">{errors.titulo_strong.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Título liviano</label>
                <input {...register("titulo_light")} placeholder="mientos" className={inputCls} />
              </div>
            </div>
            <p className="text-neutral-600 text-xs -mt-2">Se pegan sin espacio: si el corte es entre palabras, poné el espacio al inicio del liviano (ej: “ de 15”).</p>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Descripción</label>
              <textarea {...register("descripcion")} rows={3} maxLength={400} placeholder="Un espacio íntimo para…" className={inputCls} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-neutral-400">Imágenes <span className="text-neutral-600">({imagenes.length}/6 · mín. 3)</span></label>
                {imagenes.length < 6 && (
                  <CloudinaryWidget folder="beatmemo/rooftop/secciones" label="Agregar" variant="primary" onSuccess={addImagen} />
                )}
              </div>
              {imagenes.length === 0 && <p className="text-neutral-600 text-xs">Subí entre 3 y 6 imágenes a color.</p>}
              <ul className="space-y-2">
                {imagenes.map((url, i) => (
                  <li key={`${url}-${i}`} className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-12 w-16 object-cover rounded shrink-0" />
                    <span className="text-neutral-500 text-xs flex-1">Imagen {i + 1}</span>
                    <button type="button" onClick={() => moveImagen(i, -1)} disabled={i === 0} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowUp size={15} /></button>
                    <button type="button" onClick={() => moveImagen(i, 1)} disabled={i === imagenes.length - 1} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"><ArrowDown size={15} /></button>
                    <button type="button" onClick={() => removeImagen(i)} className="p-1 text-red-500 hover:text-red-400"><X size={15} /></button>
                  </li>
                ))}
              </ul>
              {errors.imagenes && <p className="text-red-500 text-xs mt-1">{errors.imagenes.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Orden</label>
                <input type="number" {...register("orden")} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm self-end p-2.5">
                <input type="checkbox" {...register("activo")} className="w-4 h-4 accent-brand-red" /> Activo
              </label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-neutral-800 flex gap-3 mb-24">
          {isEditing && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={isDeleting || isSubmitting} className="w-full md:w-auto">
              {isDeleting ? "Borrando…" : "Eliminar"}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting || isDeleting}>Cancelar</Button>
          <Button type="submit" form="tipo-evento-form" disabled={isSubmitting || isDeleting} fullWidth className="flex-1">
            {isSubmitting ? "Guardando…" : (isEditing ? "Actualizar" : "Guardar")}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen} danger loading={isDeleting}
        title="¿Eliminar este tipo de evento?"
        message="Deja de mostrarse en la landing del rooftop."
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}