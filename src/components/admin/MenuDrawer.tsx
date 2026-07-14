// src/components/admin/MenuDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UploadCloud, FileCheck, AlertTriangle } from "lucide-react";
import { upsertMenu, deleteMenu } from "@/actions/menus";
import { uploadMenuPdf } from "@/actions/menu-uploads";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  menuToEdit?: any;
}

export default function MenuDrawer({ isOpen, onClose, menuToEdit }: Props) {
  const isEditing = !!menuToEdit;
const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [activo, setActivo] = useState(true);
  const [urlArchivo, setUrlArchivo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (menuToEdit) {
      setNombre(menuToEdit.nombre || "");
      setTipo(menuToEdit.tipo || "");
      setActivo(menuToEdit.activo ?? true);
      setUrlArchivo(menuToEdit.url_archivo || "");
    } else {
      setNombre(""); setTipo(""); setActivo(true); setUrlArchivo("");
      setUploadWarning(null);
      setUploading(false);
      setSaving(false);
      setDeleting(false);
    }
    setUploadWarning(null);
  }, [menuToEdit, isOpen]);

  if (!isOpen) return null;

  // El slug/tipo se deriva del nombre solo al crear; al editar es inmutable
  // (es el nombre del archivo en Storage y la clave UNIQUE).
  const handleNombreChange = (v: string) => {
    setNombre(v);
    if (!isEditing) {
      setTipo(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación temprana en cliente: evita gastar ancho de banda subiendo
    // algo que el server va a rechazar igual.
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`El PDF pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. El máximo es 10MB.`);
      e.target.value = "";  // limpia el input para poder reintentar
      return;
    }

    setUploading(true);
    setUploadWarning(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadMenuPdf(formData, tipo);
    if (res.success && res.url) {
      setUrlArchivo(res.url);
      toast.success("PDF subido");
      if (res.warning) setUploadWarning(res.warning);
    } else {
      toast.error(res.error || "Error al subir el PDF");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!urlArchivo) {
      toast.error("Subí el PDF antes de guardar.");
      return;
    }
    setSaving(true);

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("url_archivo", urlArchivo);
    formData.append("activo", String(activo));

    const res = await upsertMenu(formData, isEditing ? menuToEdit.id : undefined);
    if (res.success) {
      toast.success(isEditing ? "Carta actualizada" : "Carta creada");
      if (res.success) {
      toast.success(isEditing ? "Carta actualizada" : "Carta creada");
      router.refresh();   // ← trae los datos nuevos del server
      onClose();
    }
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar esta carta del visor? El PDF queda en Storage.")) return;
    setDeleting(true);
    const res = await deleteMenu(menuToEdit.id);
    if (res.success) {
      toast.success("Carta eliminada");
      if (res.success) {
      toast.success(isEditing ? "Carta actualizada" : "Carta creada");
      router.refresh();   // ← trae los datos nuevos del server
      onClose();
    }
      onClose();
    } else {
      toast.error(res.error);
    }
    setDeleting(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-50 flex flex-col shadow-2xl">
        <div className="p-4 md:p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "Editar carta" : "Nueva carta"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {/* NOMBRE */}
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Nombre *</label>
            <input
              value={nombre}
              onChange={(e) => handleNombreChange(e.target.value)}
              placeholder="Carta Principal"
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none"
            />
          </div>

          {/* TIPO / SLUG */}
          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Identificador {isEditing && <span className="text-neutral-600">(no editable)</span>}
            </label>
            <input
              value={tipo}
              onChange={(e) => setTipo(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              disabled={isEditing}
              placeholder="carta-principal"
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            />
            <p className="text-neutral-600 text-xs mt-1">Se usa en la URL del QR y como nombre del archivo.</p>
          </div>

          {/* UPLOAD PDF */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Archivo PDF *</label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-800 rounded-lg p-6 cursor-pointer hover:border-neutral-600 transition">
              {uploading ? (
                <span className="text-neutral-400 text-sm">Subiendo…</span>
              ) : urlArchivo ? (
                <>
                  <FileCheck className="text-green-400" size={28} />
                  <span className="text-green-400 text-sm">PDF cargado</span>
                  <span className="text-neutral-600 text-xs">Tocá para reemplazar</span>
                </>
              ) : (
                <>
                  <UploadCloud className="text-neutral-500" size={28} />
                  <span className="text-neutral-400 text-sm">Subir PDF (máx. 10MB)</span>
                </>
              )}
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" disabled={uploading} />
            </label>

            {uploadWarning && (
              <div className="flex items-start gap-2 mt-2 text-amber-400 text-xs bg-amber-950/30 border border-amber-900/50 rounded p-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{uploadWarning}</span>
              </div>
            )}
          </div>

          {/* ACTIVO */}
          <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="w-4 h-4 accent-brand-red" />
            Carta activa (visible en el visor)
          </label>
        </div>

        <div className="p-4 md:p-6 border-t border-neutral-800 flex flex-col md:flex-row gap-3">
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="w-full md:w-auto px-4 py-3 bg-neutral-950 border border-red-900/50 hover:bg-red-950 text-red-500 font-semibold rounded-lg transition text-sm disabled:opacity-50"
            >
              {deleting ? "Borrando…" : "Eliminar"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting || uploading}
            className="w-full md:w-auto px-4 py-3 bg-neutral-950 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-lg transition text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deleting || uploading}
            className="w-full flex-1 bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm disabled:opacity-50"
          >
            {saving ? "Guardando…" : (isEditing ? "Actualizar" : "Crear carta")}
          </button>
        </div>
      </div>
    </>
  );
}