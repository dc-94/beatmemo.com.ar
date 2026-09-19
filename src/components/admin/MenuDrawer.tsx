// src/components/admin/MenuDrawer.tsx

"use client";

import {useDrawerA11y} from "@/hooks/useDrawerA11y";
import { useState, useEffect, type ChangeEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, FileCheck, AlertTriangle } from "lucide-react";
import { upsertMenu, deleteMenu } from "@/actions/menus";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  menuToEdit?: any;
}

export default function MenuDrawer({ isOpen, onClose, menuToEdit }: Props) {
  const isEditing = !!menuToEdit;
  const drawerRef = useDrawerA11y(isOpen, onClose);
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [activo, setActivo] = useState(true);
  const [urlArchivo, setUrlArchivo] = useState("");
  const [urlArchivoMovil, setUrlArchivoMovil] = useState("");
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMovil, setUploadingMovil] = useState(false);
  const [nombreDesktop, setNombreDesktop] = useState("");
  const [nombreMovil, setNombreMovil] = useState("");
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setNombre(menuToEdit?.nombre ?? "");
    setTipo(menuToEdit?.tipo ?? "");
    setActivo(menuToEdit?.activo ?? true);
    setUrlArchivo(menuToEdit?.url_archivo ?? "");   
    setUrlArchivoMovil(menuToEdit?.url_archivo_movil ?? "");
    setUploadWarning(null);
    setUrlArchivo(menuToEdit?.url_archivo ?? "");
    setUrlArchivoMovil(menuToEdit?.url_archivo_movil ?? "");
    setNombreDesktop(menuToEdit?.url_archivo ? decodeURIComponent(menuToEdit.url_archivo.split("/").pop()?.split("?")[0] ?? "") : "");
    setNombreMovil(menuToEdit?.url_archivo_movil ? decodeURIComponent(menuToEdit.url_archivo_movil.split("/").pop()?.split("?")[0] ?? "") : "");
    setUploadingDesktop(false);
    setUploadingMovil(false);
    setSaving(false);
    setDeleting(false);
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, variante: "desktop" | "movil") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!tipo) { toast.error("Primero ponele nombre a la carta."); e.target.value = ""; return; }
    if (file.type !== "application/pdf") { toast.error("Solo archivos PDF."); e.target.value = ""; return; }
    if (file.size > 15 * 1024 * 1024) { toast.error(`El PDF pesa ${(file.size/1024/1024).toFixed(1)}MB. Máximo 15MB.`); e.target.value = ""; return; }

    const setUp = variante === "movil" ? setUploadingMovil : setUploadingDesktop;
    setUp(true);
    try {
      const supabase = createClient();
      const slug = variante === "movil" ? `${tipo}-movil` : tipo;
      const path = `${slug}.pdf`;
      const { error } = await supabase.storage.from("menus").upload(path, file, { upsert: true, contentType: "application/pdf", cacheControl: "3600" });
      if (error) { toast.error(error.message || "Falló la subida."); return; }
      const { data } = supabase.storage.from("menus").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      if (variante === "movil") { setUrlArchivoMovil(url); setNombreMovil(file.name); }
      else { setUrlArchivo(url); setNombreDesktop(file.name); }
      toast.success(`PDF ${variante} subido`);
    } catch (err) { console.error(err); toast.error("Error al subir."); }
    finally { setUp(false); e.target.value = ""; }
  };

  const handleSave = async () => {
    if (!urlArchivo) {
      toast.error("Subí el PDF antes de guardar.");
      return;
    }
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("tipo", tipo);
      formData.append("url_archivo", urlArchivo);
      formData.append("url_archivo_movil", urlArchivoMovil);
      formData.append("activo", String(activo));

      const res = await upsertMenu(formData, isEditing ? menuToEdit.id : undefined);
      if (res.success) {
        toast.success(isEditing ? "Carta actualizada" : "Carta creada");
        router.refresh();
        onClose();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error("[SAVE MENU]", err);
      toast.error("Error inesperado al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!menuToEdit?.id) return;
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!menuToEdit?.id) return;
    setDeleting(true);
    try {
      const res = await deleteMenu(menuToEdit.id);
      if (res.success) { toast.success("Carta eliminada"); setConfirmOpen(false); onClose(); }
      else { toast.error(res.error || "No se pudo eliminar"); }
    } catch (e) {
      console.error("[MenuDrawer] delete falló:", e);
      toast.error("No se pudo eliminar. Revisá tu conexión.");
    } finally { setDeleting(false); }
  };

  const busy = saving || deleting || uploadingDesktop || uploadingMovil;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div ref={drawerRef} className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-50 flex flex-col shadow-2xl">
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

          {/* UPLOAD — Versión principal (desktop) */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Versión principal (desktop) <span className="text-red-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-800 rounded-lg p-6 cursor-pointer hover:border-neutral-600 transition">
              {uploadingDesktop ? (
                <span className="text-neutral-400 text-sm">Subiendo…</span>
              ) : urlArchivo ? (
                <>
                  <FileCheck className="text-green-400" size={24} />
                  <span className="text-green-400 text-sm font-mono break-all text-center px-2">{nombreDesktop || "PDF cargado"}</span>
                  <span className="text-neutral-600 text-xs">Tocá para reemplazar</span>
                </>
              ) : (
                <>
                  <UploadCloud className="text-neutral-500" size={28} />
                  <span className="text-neutral-400 text-sm">Subir PDF principal (máx. 15MB)</span>
                </>
              )}
              <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, "desktop")} className="hidden" disabled={uploadingDesktop} />
            </label>
          </div>

          {/* UPLOAD — Versión móvil (opcional) */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Versión móvil <span className="text-neutral-600 text-xs">(opcional — si no la subís, se usa la principal)</span>
            </label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-800 rounded-lg p-6 cursor-pointer hover:border-neutral-600 transition">
              {uploadingMovil ? (
                <span className="text-neutral-400 text-sm">Subiendo…</span>
              ) : urlArchivoMovil ? (
                <>
                  <FileCheck className="text-green-400" size={28} />
                  <span className="text-green-400 text-sm">{nombreMovil || "PDF cargado"}</span>
                  <span className="text-neutral-600 text-xs">Tocá para reemplazar</span>
                </>
              ) : (
                <>
                  <UploadCloud className="text-neutral-500" size={28} />
                  <span className="text-neutral-400 text-sm">Subir PDF móvil (máx. 10MB)</span>
                </>
              )}
              <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, "movil")} className="hidden" disabled={uploadingMovil} />
            </label>
          </div>

          {uploadWarning && (
            <div className="flex items-start gap-2 mt-2 text-amber-400 text-xs bg-amber-950/30 border border-amber-900/50 rounded p-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{uploadWarning}</span>
            </div>
          )}

          {/* ACTIVO */}
          <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-4 h-4 accent-brand-red"
            />
            Carta activa (visible en el visor)
          </label>
        </div>

        <div className="p-4 md:p-6 border-t border-neutral-800 flex flex-col md:flex-row gap-3 mb-24">
          {isEditing && (
            <Button variant="danger" onClick={handleDelete} disabled={busy} className="w-full md:w-auto">
              {deleting ? "Borrando…" : "Eliminar"}
            </Button>
          )}
          {/* Cancelar: variante ghost. Nunca se bloquea por uploading, solo por escritura en curso. */}
          <Button variant="ghost" type="button" onClick={onClose} disabled={saving || deleting} className="w-full md:w-auto border border-neutral-700">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={busy} fullWidth className="flex-1">
            {saving ? "Guardando…" : isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen} danger loading={deleting}
        title="¿Eliminar esta Carta?"
        message="Se elimina la carta de la pagina."
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}