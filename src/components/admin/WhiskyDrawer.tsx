// src/components/admin/WhiskyDrawer.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import CloudinaryWidget from "./CloudinaryWidget";
import { upsertWhisky, deleteWhisky } from "@/actions/whiskies";
import { whiskySchema, COLECCIONES } from "@/lib/validations/whiskies";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  whiskyToEdit?: any;
}

// Etiquetas legibles de las colecciones. Los VALUES son los 5 del enum/CHECK.
const COL_LABEL: Record<string, string> = {
  blended: "Blended",
  blended_malts: "Blended Malts",
  irish: "Irish",
  single_malt: "Single Malt",
  bourbon: "Bourbon",
};

export default function WhiskyDrawer({ isOpen, onClose, whiskyToEdit }: Props) {
  const isEditing = !!whiskyToEdit;
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(whiskySchema),
    // Solo constantes. El dato real entra por reset en el useEffect. Igual que
    // EventDrawer: defaultValues con el dato metía los null de la DB antes de tiempo.
    defaultValues: { coleccion: "blended", tiene_hh: false, disponible: true, orden: 0 },
  });

  const logoUrl = watch("logo_url");

  // El drawer se monta/desmonta con isOpen, y el contenedor le pasa
  // key={editing?.id ?? "new"}. Con la key, cada apertura es una instancia
  // nueva → el reset del render inicial ya trae el dato correcto. No hace
  // falta useEffect: la key garantiza el remonte.
  // Pero como el form se inicializa una vez, seteamos el dato al montar:
  if (whiskyToEdit && watch("marca") === undefined) {
    reset({
      marca: whiskyToEdit.marca ?? "",
      expresion: whiskyToEdit.expresion ?? "",
      coleccion: whiskyToEdit.coleccion ?? "blended",
      logo_url: whiskyToEdit.logo_url ?? "",
      tiene_hh: whiskyToEdit.tiene_hh ?? false,
      disponible: whiskyToEdit.disponible ?? true,
      orden: whiskyToEdit.orden ?? 0,
    });
  }

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) return;
        formData.append(key, value === null ? "" : String(value));
      });
      if (isEditing) formData.append("id", whiskyToEdit.id);

      const res = await upsertWhisky(formData);
      if (res.success) {
        toast.success(isEditing ? "Whisky actualizado" : "Whisky creado");
        onClose();
      } else {
        toast.error(res.error || "No se pudo guardar");
      }
    } catch (e) {
      console.error("[WhiskyDrawer] upsert falló:", e);
      toast.error("No se pudo guardar. Revisá tu conexión.");
    }
  };

  const handleDelete = async () => {
    if (!whiskyToEdit?.id) return;
    if (!window.confirm("¿Eliminar este whisky? Se oculta del sitio pero queda guardado.")) return;
    setIsDeleting(true);
    try {
      const res = await deleteWhisky(whiskyToEdit.id);
      if (res.success) { toast.success("Whisky eliminado"); onClose(); }
      else { toast.error(res.error || "No se pudo eliminar"); }
    } catch (e) {
      console.error("[WhiskyDrawer] delete falló:", e);
      toast.error("No se pudo eliminar. Revisá tu conexión.");
    } finally {
      setIsDeleting(false);
    }
  };

  const inputCls = "w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none text-sm";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-50 flex flex-col shadow-2xl">
        <div className="p-4 md:p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">{isEditing ? "Editar whisky" : "Nuevo whisky"}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <form id="whisky-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* MARCA */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Marca *</label>
              <input {...register("marca")} placeholder="Johnnie Walker" className={inputCls} />
              {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca.message as string}</p>}
            </div>

            {/* EXPRESIÓN */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Expresión / añada <span className="text-neutral-600">(la que hay en stock)</span>
              </label>
              <input {...register("expresion")} placeholder="Blue Label · 18 años · John Lennon" className={inputCls} />
            </div>

            {/* COLECCIÓN */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Colección *</label>
              <select {...register("coleccion")} className={inputCls}>
                {COLECCIONES.map((c) => (
                  <option key={c} value={c}>{COL_LABEL[c]}</option>
                ))}
              </select>
              {errors.coleccion && <p className="text-red-500 text-xs mt-1">{errors.coleccion.message as string}</p>}
            </div>

            {/* LOGO */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Logo de la marca <span className="text-neutral-600">(PNG transparente, se muestra sobre fondo oscuro)</span>
              </label>
              {logoUrl ? (
                <div className="flex items-center gap-3 p-2 bg-neutral-950 border border-neutral-800 rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="" className="h-10 w-24 object-contain" />
                  <span className="text-green-500 text-xs flex-1">✓ Logo cargado</span>
                  <button type="button" onClick={() => setValue("logo_url", "", { shouldValidate: true })}
                    className="text-red-500 hover:text-red-400 text-xs font-semibold px-2 py-1">
                    Quitar
                  </button>
                </div>
              ) : (
                <CloudinaryWidget folder="beatmemo/whisky" label="Subir logo" onSuccess={(url) => setValue("logo_url", url, { shouldValidate: true })} />
              )}
            </div>

            {/* ORDEN */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Orden en el carrusel</label>
              <input type="number" {...register("orden")} className={inputCls} />
            </div>

            {/* FLAGS */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                <input type="checkbox" {...register("tiene_hh")} className="w-4 h-4 accent-brand-red" />
                Tiene Happy Hour (muestra el sello)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                <input type="checkbox" {...register("disponible")} className="w-4 h-4 accent-brand-red" />
                Disponible (visible en el sitio)
              </label>
            </div>
          </form>
        </div>

        <div className="p-4 md:p-6 border-t border-neutral-800 flex flex-col md:flex-row gap-3">
          {isEditing && (
            <button type="button" onClick={handleDelete} disabled={isDeleting || isSubmitting}
              className="w-full md:w-auto px-4 py-3 bg-neutral-950 border border-red-900/50 hover:bg-red-950 text-red-500 font-semibold rounded-lg transition text-sm disabled:opacity-50">
              {isDeleting ? "Borrando…" : "Eliminar"}
            </button>
          )}
          <button type="submit" form="whisky-form" disabled={isSubmitting || isDeleting}
            className="w-full flex-1 bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm disabled:opacity-50">
            {isSubmitting ? "Guardando…" : (isEditing ? "Actualizar" : "Guardar")}
          </button>
        </div>
      </div>
    </>
  );
}