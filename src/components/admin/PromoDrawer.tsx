// src/components/admin/PromoDrawer.tsx
"use client";

import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CloudinaryWidget from "./CloudinaryWidget";
import { upsertPromocion, deletePromocion } from "@/actions/promociones";
import { promocionSchema } from "@/lib/validations/promociones";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  promoToEdit?: any;
}

const DIAS = [
  { n: 1, label: "Lun" }, { n: 2, label: "Mar" }, { n: 3, label: "Mié" },
  { n: 4, label: "Jue" }, { n: 5, label: "Vie" }, { n: 6, label: "Sáb" }, { n: 7, label: "Dom" },
];

export default function PromoDrawer({ isOpen, onClose, promoToEdit }: Props) {
  const isEditing = !!promoToEdit;
  const [isDeleting, setIsDeleting] = useState(false);
  const [dias, setDias] = useState<number[]>([]);

  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(promocionSchema),
    defaultValues: { tipo: "local", activo: true, prioridad: 0 },
  });

  const tipo = watch("tipo");
  const logoUrl = watch("logo_url");
  const imagenUrl = watch("imagen_url");

  useEffect(() => {

    if (promoToEdit) {
      const diasArr: number[] = Array.isArray(promoToEdit.dias_semana) ? promoToEdit.dias_semana : [];
      setDias(diasArr);
      reset({
        ...promoToEdit,
        descripcion: promoToEdit.descripcion ?? "",
        entidad: promoToEdit.entidad ?? "",
        logo_url: promoToEdit.logo_url ?? "",
        imagen_url: promoToEdit.imagen_url ?? "",
        alt_texto: promoToEdit.alt_texto ?? "",
        fecha_desde: promoToEdit.fecha_desde ?? "",
        fecha_hasta: promoToEdit.fecha_hasta ?? "",
        dias_semana: diasArr.join(","),
      });
    } else {
      setDias([]);
      reset({
        tipo: "local", titulo: "", descripcion: "", entidad: "",
        logo_url: "", imagen_url: "", fecha_desde: "", fecha_hasta: "", dias_semana: "",
        activo: true, prioridad: 0,
      });
    }
  }, [promoToEdit, reset]);

  useEffect(() => {
    if (!isOpen) return;
    if (tipo === "banco") {
      setValue("imagen_url", "");
    } else {
      setValue("logo_url", "");
    }
  }, [tipo, isOpen, setValue]);
  // Sincroniza el estado visual de días → el campo del form (CSV).
  const toggleDia = (n: number) => {
    const next = dias.includes(n) ? dias.filter((d) => d !== n) : [...dias, n].sort();
    setDias(next);
    setValue("dias_semana", next.join(","));
  };

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value === null ? "" : String(value));
      });

      const res = await upsertPromocion(formData, isEditing ? promoToEdit.id : undefined);
      if (res.success) {
        toast.success(isEditing ? "Promoción actualizada" : "Promoción creada");
        onClose();
      } else {
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([campo, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : msgs;
            if (msg) setError(campo as any, { type: "server", message: msg });
          });
        }
        // El error general (no de campo) sigue yendo al toast.
        toast.error(res.error || "Revisá los campos marcados");
      }
    } catch (e) {
      console.error("[PromoDrawer] upsert falló:", e);
      toast.error("No se pudo guardar. Revisá tu conexión y probá de nuevo.");
    }
  };

  const handleDelete = async () => {
    if (!promoToEdit?.id) return;
    if (!window.confirm("¿Eliminar esta promoción? Se oculta del sitio, pero queda guardada y se puede recuperar.")) return;
    setIsDeleting(true);
    try {
      const res = await deletePromocion(promoToEdit.id);
      if (res.success) { toast.success("Promoción eliminada"); onClose(); }
      else { toast.error(res.error || "No se pudo eliminar"); }
    } catch (e) {
      console.error("[PromoDrawer] delete falló:", e);
      toast.error("No se pudo eliminar. Revisá tu conexión y probá de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const drawerRef = useDrawerA11y(isOpen, onClose);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div ref={drawerRef} className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-50 flex flex-col shadow-2xl">
        <div className="p-4 md:p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">{isEditing ? "Editar promoción" : "Nueva promoción"}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <form id="promo-form" onSubmit={handleSubmit(onSubmit, (errs) => console.log("VALIDATION FAIL:", errs))}>
            {/* TIPO */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Tipo de promoción *</label>
              <select {...register("tipo")}
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none">
                <option value="banco">Banco / Tarjeta</option>
                <option value="fecha_especial">Fecha especial</option>
                <option value="local">Promo del local</option>
              </select>
            </div>

            {/* TÍTULO */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Título *</label>
              <input {...register("titulo")} placeholder="Ej: 20% de descuento"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message as string}</p>}
            </div>

            {/* ENTIDAD — solo banco */}
            {tipo === "banco" && (
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Entidad (banco/billetera) *</label>
                <input {...register("entidad")} placeholder="Ej: Galicia, Modo, Cuenta DNI"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
                {errors.entidad && <p className="text-red-500 text-xs mt-1">{errors.entidad.message as string}</p>}
              </div>
            )}

            {/* DESCRIPCIÓN */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Descripción</label>
              <textarea {...register("descripcion")} rows={2} placeholder="Detalle de la promo…"
                className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
            </div>

            {/* ASSET VISUAL — depende del tipo */}
            {tipo === "banco" ? (
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Logo del banco/entidad <span className="text-neutral-600">(se recomienda PNG con fondo transparente)</span>
                </label>
                {logoUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-neutral-950 border border-neutral-800 rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" className="h-8 w-20 object-contain" />
                    <span className="text-green-500 text-xs flex-1">✓ Logo cargado</span>
                    <button type="button" onClick={() => setValue("logo_url", "", { shouldValidate: true })}
                      className="text-red-500 hover:text-red-400 text-xs font-semibold px-2 py-1">
                      Quitar
                    </button>
                  </div>
                ) : (
                  <CloudinaryWidget folder="beatmemo/promos" label="Subir logo" onSuccess={(url) => setValue("logo_url", url, { shouldValidate: true })} />
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Imagen de fondo <span className="text-neutral-600">(1200×630 · la card usa esta foto)</span>
                </label>
                {imagenUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-neutral-950 border border-neutral-800 rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagenUrl} alt="" className="h-10 w-16 object-cover rounded" />
                    <span className="text-green-500 text-xs flex-1">✓ Imagen cargada</span>
                    <button type="button" onClick={() => setValue("imagen_url", "", { shouldValidate: true })}
                      className="text-red-500 hover:text-red-400 text-xs font-semibold px-2 py-1">
                      Quitar
                    </button>
                  </div>
                ) : (
                  <CloudinaryWidget folder="beatmemo/promos" label="Subir imagen" onSuccess={(url) => setValue("imagen_url", url, { shouldValidate: true })} />
                )}
              </div>
            )}

            {/* DÍAS DE LA SEMANA */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Días que aplica (vacío = todos)</label>
              <div className="flex flex-wrap gap-2">
                {DIAS.map((d) => (
                  <button key={d.n} type="button" onClick={() => toggleDia(d.n)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                      dias.includes(d.n) ? "bg-brand-red text-white" : "bg-neutral-950 border border-neutral-800 text-neutral-400"
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("dias_semana")} />
            </div>

            {/* RANGO DE FECHAS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Desde (opcional)</label>
                <input type="date" {...register("fecha_desde")}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Hasta (opcional)</label>
                <input type="date" {...register("fecha_hasta")}
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none [color-scheme:dark]" />
                {errors.fecha_hasta && <p className="text-red-500 text-xs mt-1">{errors.fecha_hasta.message as string}</p>}
              </div>
            </div>

            {/* PRIORIDAD + LINK */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Prioridad (mayor = primero)</label>
                <input type="number" {...register("prioridad")} placeholder="0"
                  className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
              </div>
            </div>

            {/* ACTIVO */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded">
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                <input type="checkbox" {...register("activo")} className="w-4 h-4 accent-brand-red" />
                Activa (visible en el sitio si está vigente)
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
          <button type="submit" form="promo-form" disabled={isSubmitting || isDeleting}
            className="w-full flex-1 bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm disabled:opacity-50">
            {isSubmitting ? "Guardando…" : (isEditing ? "Actualizar" : "Crear promoción")}
          </button>
        </div>
      </div>
    </>
  );
}