// src/components/admin/EspacioDrawer.tsx
"use client";

import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import CloudinaryWidget from "./CloudinaryWidget";
import { upsertEspacio, deleteEspacio } from "@/actions/espacio";
import { espacioSchema } from "@/lib/validations/espacio";


export default function EspacioDrawer({ isOpen, onClose, fotoToEdit }: { isOpen: boolean; onClose: () => void; fotoToEdit?: any }) {
  const isEditing = !!fotoToEdit;
  const [isDeleting, setIsDeleting] = useState(false);

  const drawerRef = useDrawerA11y(isOpen, onClose);
  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(espacioSchema),
    defaultValues: {
      imagen_url: fotoToEdit?.imagen_url ?? "",
      titulo: fotoToEdit?.titulo ?? "",
      epigrafe: fotoToEdit?.epigrafe ?? "",
      orden: fotoToEdit?.orden ?? 0,
      visible: fotoToEdit?.visible ?? true,
    },
  });

  const imagenUrl = watch("imagen_url");

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v === null ? "" : String(v)); });
      if (isEditing) fd.append("id", fotoToEdit.id);

      const res = await upsertEspacio(fd);
      if (res.success) { toast.success(isEditing ? "Foto actualizada" : "Foto agregada"); onClose(); }
      else {
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([campo, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : msgs;
            if (msg) setError(campo as any, { type: "server", message: msg });
          });
        }
        toast.error(res.error || "Revisá los campos marcados");
      }
    } catch (e) { console.error("[EspacioDrawer]", e); toast.error("Error de conexión."); }
  };

  const handleDelete = async () => {
    if (!fotoToEdit?.id || !window.confirm("¿Eliminar esta foto?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteEspacio(fotoToEdit.id);
      if (res.success) { toast.success("Foto eliminada"); onClose(); }
      else { toast.error(res.error || "No se pudo eliminar"); }
    } catch (e) { console.error("[EspacioDrawer delete]", e); toast.error("Error de conexión."); }
    finally { setIsDeleting(false); }
  };

  const inputCls = "w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none text-sm";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-50 flex flex-col shadow-2xl" ref={drawerRef}>
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">{isEditing ? "Editar foto" : "Nueva foto"}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <form id="espacio-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Imagen *</label>
              {imagenUrl ? (
                <div className="flex items-center gap-3 p-2 bg-neutral-950 border border-neutral-800 rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagenUrl} alt="" className="h-14 w-24 object-cover rounded" />
                  <span className="text-green-500 text-xs flex-1">✓ Cargada</span>
                  <button type="button" onClick={() => setValue("imagen_url", "", { shouldValidate: true })} className="text-red-500 text-xs font-semibold px-2 py-1">Quitar</button>
                </div>
              ) : (
                <CloudinaryWidget folder="beatmemo/espacio" label="Subir foto" onSuccess={(url) => setValue("imagen_url", url, { shouldValidate: true })} />
              )}
              {errors.imagen_url && <p className="text-red-500 text-xs mt-1">{errors.imagen_url.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Título</label>
              <input {...register("titulo")} placeholder="La barra" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Epígrafe</label>
              <input {...register("epigrafe")} placeholder="Donde nacen los tragos de autor" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Orden</label>
              <input type="number" {...register("orden")} className={inputCls} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-white text-sm p-4 bg-neutral-950 border border-neutral-800 rounded">
              <input type="checkbox" {...register("visible")} className="w-4 h-4 accent-brand-red" /> Visible en el sitio
            </label>
          </form>
        </div>
        <div className="p-6 border-t border-neutral-800 flex gap-3">
          {isEditing && (
            <button type="button" onClick={handleDelete} disabled={isDeleting} className="px-4 py-3 bg-neutral-950 border border-red-900/50 hover:bg-red-950 text-red-500 font-semibold rounded-lg text-sm disabled:opacity-50">
              {isDeleting ? "Borrando…" : "Eliminar"}
            </button>
          )}
          <button type="submit" form="espacio-form" disabled={isSubmitting || isDeleting} className="flex-1 bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-lg text-sm disabled:opacity-50">
            {isSubmitting ? "Guardando…" : (isEditing ? "Actualizar" : "Guardar")}
          </button>
        </div>
      </div>
    </>
  );
}