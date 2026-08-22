// src/components/admin/PubDrawer.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CloudinaryWidget from "./CloudinaryWidget";
import { upsertPubItem, deletePubItem } from "@/actions/pub";
import { pubItemSchema } from "@/lib/validations/pub";

interface Props {
  categorias: string[];
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: any;
}

// Los 5 atributos dietéticos/marketing + los 2 de visibilidad se renderizan como checkboxes.
const ATRIBUTOS = [
  { key: "es_vegetariano", label: "Vegetariano" },
  { key: "es_vegano", label: "Vegano" },
  { key: "es_sin_tacc", label: "Sin TACC" },
  { key: "es_nuevo", label: "Nuevo" },
  { key: "es_recomendado", label: "Recomendado" },
];

export default function PubDrawer({ categorias, isOpen, onClose, itemToEdit }: Props) {
  const isEditing = !!itemToEdit;
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { register, handleSubmit, setValue, reset, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(pubItemSchema),
    defaultValues: { disponible: true, categoria: "" },
  });
  
  const facetaActual = watch("faceta");
  
  useEffect(() => {
    if (itemToEdit) {
      reset({
        ...itemToEdit,
        categoria: itemToEdit.categoria || "",
        faceta: itemToEdit.faceta || "",
        ingredientes: Array.isArray(itemToEdit.ingredientes) ? itemToEdit.ingredientes.join(", ") : "",
      });
    } else {
      reset({
        nombre: "", categoria: "", descripcion: "", url_imagen: "",
        es_vegetariano: false, es_vegano: false, es_sin_tacc: false,
        es_nuevo: false, es_recomendado: false,
        destacado_home: false, hero_destacado: false, disponible: true, orden: 0,
        faceta: "", ingredientes: "", 
      });
    }
  }, [itemToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      // Cache-busting en la imagen, igual que en EventDrawer.
      if (data.url_imagen && !data.url_imagen.includes("?t=")) {
        data.url_imagen = `${data.url_imagen}?t=${Date.now()}`;
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const res = await upsertPubItem(formData, isEditing ? itemToEdit.id : undefined);
      if (res.success) {
        toast.success(isEditing ? "Item actualizado" : "Item creado");
        onClose();
      } else {
       if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([campo, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : msgs;
            if (msg) setError(campo as any, { type: "server", message: msg });
          });
        }
        toast.error(res.error || "Revisá los campos marcados");
      }
    } catch (e) {
      console.error("[PubDrawer] upsert falló:", e);
      toast.error("No se pudo guardar. Revisá tu conexión y probá de nuevo.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este item del menú? Podés recuperarlo desde la base si hace falta.")) return;
    setIsDeleting(true);
    try {
      const res = await deletePubItem(itemToEdit.id);
      if (res.success) {
        toast.success("Item eliminado");
        onClose();
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      console.error("[PubDrawer] delete falló:", e);
      toast.error("No se pudo eliminar. Revisá tu conexión y probá de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-50 flex flex-col shadow-2xl">
        <div className="p-4 md:p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "Editar item" : "Nuevo item"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <form id="pub-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* NOMBRE */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Nombre *</label>
              <input {...register("nombre")} placeholder="Ej: Spritz Clásico"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message as string}</p>}
            </div>

            {/* CATEGORÍA */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Categoría *</label>
              <select {...register("categoria")}
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none">
                <option value="">Seleccioná…</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message as string}</p>}
            </div>
              {/* FACETA — en qué bloque de /pub se muestra */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Seccion <span className="text-neutral-600">(dónde se muestra en la pagina)</span>
              </label>
              <select {...register("faceta")} className="w-full bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-sm focus:border-brand-red outline-none">
                <option value="">No mostrar</option>
                <option value="cafe">Café y meriendas</option>
                <option value="ejecutivo">Menú ejecutivo</option>
                <option value="cocina">La cocina</option>
                <option value="variedad">3 platos</option>
                <option value="barra_autor">Barra de autor (cóctel)</option>
              </select>
            </div>

            {/* INGREDIENTES — solo para cócteles de autor */}
            {facetaActual === "barra_autor" && (
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Ingredientes <span className="text-neutral-600">(separados por coma, se muestran como lista)</span>
                </label>
                <input
                  {...register("ingredientes")}
                  placeholder="Ron Bacardí, Limón, Almíbar de almendras, Albahaca"
                  className="w-full bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-sm focus:border-brand-red outline-none"
                />
              </div>
            )}
            {/* DESCRIPCIÓN */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Descripción</label>
              <textarea {...register("descripcion")} rows={3} placeholder="Detalles del plato o trago…"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
            </div>

            {/* ORDEN */}
            <div className="grid grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Orden</label>
                <input type="number" {...register("orden")} placeholder="0"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
              </div>
            </div>

            {/* ATRIBUTOS (checkboxes) */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded space-y-3">
              <span className="block text-sm text-neutral-400">Atributos</span>
              <div className="grid grid-cols-2 gap-3">
                {ATRIBUTOS.map((a) => (
                  <label key={a.key} className="flex items-center gap-2 cursor-pointer text-white text-sm">
                    <input type="checkbox" {...register(a.key as any)} className="w-4 h-4 accent-brand-red" />
                    {a.label}
                  </label>
                ))}
              </div>
            </div>

            {/* VISIBILIDAD */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded space-y-3">
              <span className="block text-sm text-neutral-400">Visibilidad</span>
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                <input type="checkbox" {...register("destacado_home")} className="w-4 h-4 accent-brand-red" />
                Mostrar en el home
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                <input type="checkbox" {...register("hero_destacado")} className="w-4 h-4 accent-amber-500" />
                Destacar como pieza principal (home)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                <input type="checkbox" {...register("disponible")} className="w-4 h-4 accent-brand-red" />
                Disponible (visible en el menú)
              </label>
            </div>

            {/* IMAGEN */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Imagen *</label>
              <CloudinaryWidget folder="beatmemo/pub" onSuccess={(url: string) => setValue("url_imagen", url, { shouldValidate: true })} />
              {errors.url_imagen && <p className="text-red-500 text-xs mt-1">{errors.url_imagen.message as string}</p>}
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
          <button type="submit" form="pub-form" disabled={isSubmitting || isDeleting}
            className="w-full flex-1 bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm disabled:opacity-50">
            {isSubmitting ? "Guardando…" : (isEditing ? "Actualizar" : "Confirmar y guardar")}
          </button>
        </div>
      </div>
    </>
  );
}