// src/components/admin/ContenidoForm.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import CloudinaryWidget from "./CloudinaryWidget";
import { updateSiteContent } from "@/actions/site-content";

export interface SeccionData {
  clave: string;
  imagen_url: string | null;
  alt_texto: string | null;
  titulo: string | null;
  subtitulo: string | null;
  cuerpo: string | null;
  cta_mostrar: boolean;
  cta_texto: string | null;
  cta_link: string | null;
}

export default function ContenidoForm({ seccion }: { seccion: SeccionData }) {
  // useState, no RHF: es un form chico de campos simples + un upload.
  // Mismo criterio que MenuDrawer (documentado en AGENTS).
  const [imagenUrl, setImagenUrl] = useState(seccion.imagen_url ?? "");
  const [ctaMostrar, setCtaMostrar] = useState(seccion.cta_mostrar);
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setGuardando(true);
    try {
      // Inyectamos los valores controlados por estado (no vienen del form nativo).
      formData.set("clave", seccion.clave);
      formData.set("imagen_url", imagenUrl);
      formData.set("cta_mostrar", ctaMostrar ? "true" : "false");

      const res = await updateSiteContent(formData);
      if (res.success) {
        toast.success("Contenido actualizado");
      } else {
        toast.error(res.error || "No se pudo guardar");
        if (res.fieldErrors) {
          Object.values(res.fieldErrors).flat().forEach((m) => m && toast.error(m));
        }
      }
    } catch (e) {
      console.error("[ContenidoForm]", e);
      toast.error("Error de conexión. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const inputCls =
    "w-full bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-sm focus:border-brand-red outline-none";
  const labelCls = "block text-sm text-neutral-400 mb-1";

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* IMAGEN */}
      <div>
        <label className={labelCls}>Imagen de encabezado</label>
        {imagenUrl ? (
          <div className="flex items-center gap-3 p-2 bg-neutral-900 border border-neutral-800 rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagenUrl} alt="" className="h-14 w-24 object-cover rounded" />
            <span className="text-green-500 text-xs flex-1">✓ Imagen cargada</span>
            <button type="button" onClick={() => setImagenUrl("")} className="text-red-500 hover:text-red-400 text-xs font-semibold px-2 py-1">
              Quitar
            </button>
          </div>
        ) : (
          <CloudinaryWidget folder="beatmemo/hero" label="Subir imagen" onSuccess={(url) => setImagenUrl(url)} />
        )}
      </div>

      {/* ALT — obligatorio para accesibilidad */}
      <div>
        <label className={labelCls}>Texto alternativo de la imagen <span className="text-neutral-600">(describe la foto para lectores de pantalla)</span></label>
        <input name="alt_texto" defaultValue={seccion.alt_texto ?? ""} className={inputCls} maxLength={200} />
      </div>

      {/* TÍTULO + SUBTÍTULO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Título</label>
          <input name="titulo" defaultValue={seccion.titulo ?? ""} className={inputCls} maxLength={120} />
        </div>
        <div>
          <label className={labelCls}>Subtítulo</label>
          <input name="subtitulo" defaultValue={seccion.subtitulo ?? ""} className={inputCls} maxLength={200} />
        </div>
      </div>

      {/* CUERPO */}
      <div>
        <label className={labelCls}>Texto</label>
        <textarea name="cuerpo" defaultValue={seccion.cuerpo ?? ""} rows={3} className={inputCls} maxLength={2000} />
      </div>

      {/* CTA */}
      <div className="border border-neutral-800 rounded p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={ctaMostrar} onChange={(e) => setCtaMostrar(e.target.checked)} className="w-4 h-4 accent-brand-red" />
          <span className="text-sm text-white font-medium">Mostrar botón (CTA)</span>
        </label>

        {ctaMostrar && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className={labelCls}>Texto del botón</label>
              <input name="cta_texto" defaultValue={seccion.cta_texto ?? ""} className={inputCls} maxLength={40} placeholder="Ver menú" />
            </div>
            <div>
              <label className={labelCls}>Destino <span className="text-neutral-600">(/menu o https://…)</span></label>
              <input name="cta_link" defaultValue={seccion.cta_link ?? ""} className={inputCls} placeholder="/menu" />
            </div>
          </div>
        )}
      </div>

      <button type="submit" disabled={guardando} className="bg-brand-red hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded transition text-sm disabled:opacity-50">
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}