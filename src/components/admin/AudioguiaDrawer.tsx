// src/components/admin/AudioguiaDrawer.tsx
"use client";

import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UploadCloud, FileCheck } from "lucide-react";
import CloudinaryWidget from "./CloudinaryWidget";
import { upsertAudioguiaTrack, deleteAudioguiaTrack } from "@/actions/audioguia";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trackToEdit?: any;
  nextOrden: number;
}

export default function AudioguiaDrawer({ isOpen, onClose, trackToEdit, nextOrden }: Props) {
  const isEditing = !!trackToEdit;
  const drawerRef = useDrawerA11y(isOpen, onClose);
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [activo, setActivo] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [audioNombre, setAudioNombre] = useState("");
  const [imagenNombre, setImagenNombre] = useState("");
  // Reset al abrir (patrón uniforme: isOpen en deps + todos los campos).
  useEffect(() => {
    if (!isOpen) return;
    setTitulo(trackToEdit?.titulo ?? "");
    setDescripcion(trackToEdit?.descripcion ?? "");
    setImagenUrl(trackToEdit?.imagen_url ?? "");
    setAudioUrl(trackToEdit?.audio_url ?? "");
    setAudioNombre(trackToEdit?.audio_url ? decodeURIComponent(trackToEdit.audio_url.split("/").pop()?.split("?")[0] ?? "") : "");
    setImagenNombre(trackToEdit?.imagen_url ? decodeURIComponent(trackToEdit.imagen_url.split("/").pop()?.split("?")[0] ?? "") : "");
    setActivo(trackToEdit?.activo ?? true);
    setUploading(false); setSaving(false); setDeleting(false);
  }, [trackToEdit, isOpen]);

  if (!isOpen) return null;

  // Slug para el nombre del MP3 en Storage: del título (año). Estable al editar.
  const slug = (trackToEdit?.id
    ? (trackToEdit.audio_url ? trackToEdit.audio_url.split("/").pop()?.replace(/\.mp3.*$/, "") : "")
    : "") || titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!titulo.trim()) { toast.error("Primero ponele título a la pista."); e.target.value = ""; return; }
    if (file.size > 50 * 1024 * 1024) { toast.error(`El audio pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo 50MB.`); e.target.value = ""; return; }

    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${slug || `track-${nextOrden}`}.mp3`;
      // upload directo cliente → Storage. No pasa por Server Action ni middleware.
      const { error } = await supabase.storage
        .from("audioguia")
        .upload(path, file, { upsert: true, contentType: "audio/mpeg", cacheControl: "3600" });

      if (error) {
        console.error("[audioguia upload]", error);
        toast.error(error.message || "Falló la subida del audio.");
        return;
      }

      const { data } = supabase.storage.from("audioguia").getPublicUrl(path);
      setAudioUrl(`${data.publicUrl}?t=${Date.now()}`);  // cache-bust
      setAudioNombre(file.name);
      toast.success("Audio subido");
    } catch (err) {
      console.error("[audioguia upload]", err);
      toast.error("Error al subir. Probá de nuevo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!titulo.trim()) { toast.error("Falta el título."); return; }
    if (!audioUrl) { toast.error("Subí el audio antes de guardar."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo", titulo);
      fd.append("descripcion", descripcion);
      fd.append("imagen_url", imagenUrl);
      fd.append("audio_url", audioUrl);
      fd.append("orden", String(trackToEdit?.orden ?? nextOrden));
      fd.append("activo", String(activo));

      const res = await upsertAudioguiaTrack(fd, isEditing ? trackToEdit.id : undefined);
      if (res.success) { toast.success(isEditing ? "Pista actualizada" : "Pista creada"); router.refresh(); onClose(); }
      else toast.error(res.error || "Revisá los campos");
    } catch (err) {
      console.error("[AudioguiaDrawer save]", err);
      toast.error("Error inesperado al guardar.");
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!trackToEdit?.id) return;
    setDeleting(true);
    try {
      const res = await deleteAudioguiaTrack(trackToEdit.id);
      if (res.success) { toast.success("Pista eliminada"); setConfirmOpen(false); router.refresh(); onClose(); }
      else toast.error(res.error || "No se pudo eliminar");
    } catch (e) {
      console.error("[AudioguiaDrawer delete]", e);
      toast.error("No se pudo eliminar. Revisá tu conexión.");
    } finally { setDeleting(false); }
  };

  const busy = saving || deleting || uploading;
  const inputCls = "w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none text-sm";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div ref={drawerRef} className="fixed inset-y-0 right-0 w-full max-w-lg bg-neutral-900 z-[60] flex flex-col shadow-2xl">
        <div className="p-4 md:p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">{isEditing ? "Editar pista" : "Nueva pista"}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {/* TÍTULO (el año) */}
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Título / año *</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="1957 - El místico encuentro" className={inputCls} />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={5} placeholder="El texto que se lee mientras suena el audio. Usá saltos de línea para separar ideas." className={inputCls} />
          </div>

          {/* AUDIO (Supabase Storage) */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Audio (MP3) *</label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-800 rounded-lg p-6 cursor-pointer hover:border-neutral-600 transition">
              {uploading ? (
                <span className="text-neutral-400 text-sm">Subiendo…</span>
              ) : audioUrl ? (
                <>
                  <FileCheck className="text-green-400" size={28} />
                  <span className="text-green-400 text-sm">{audioNombre || "Audio cargado"}</span>
                  <span className="text-neutral-600 text-xs">Tocá para reemplazar</span>
                </>
              ) : (
                <>
                  <UploadCloud className="text-neutral-500" size={28} />
                  <span className="text-neutral-400 text-sm">Subir MP3 (máx. 20MB)</span>
                </>
              )}
              <input type="file" accept="audio/mpeg,.mp3" onChange={handleAudio} className="hidden" disabled={uploading} />
            </label>
            {audioUrl && (
              <audio controls src={audioUrl} className="w-full mt-2 h-9" />
            )}
          </div>

          {/* IMAGEN (Cloudinary) */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Imagen</label>
            {imagenUrl ? (
              <div className="flex items-center gap-3 p-2 bg-neutral-950 border border-neutral-800 rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagenUrl} alt="" className="h-14 w-20 object-cover rounded" />
                <span className="text-green-500 text-xs flex-1">✓ Cargada</span>
                <button type="button" onClick={() => setImagenUrl("")} className="text-red-500 text-xs font-semibold px-2 py-1">Quitar</button>
              </div>
            ) : (
              <CloudinaryWidget folder="beatmemo/audioguia" label="Subir imagen" onSuccess={(url) => setImagenUrl(url)} />
            )}
          </div>

          {/* ACTIVO */}
          <label className="flex items-center gap-2 cursor-pointer text-white text-sm p-4 bg-neutral-950 border border-neutral-800 rounded">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="w-4 h-4 accent-brand-red" />
            Pista activa (visible en la audioguía)
          </label>
        </div>

        {/* FOOTER fijo */}
        <div className="shrink-0 p-4 md:p-6 border-t border-neutral-800 flex flex-col md:flex-row gap-3">
          {isEditing && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={busy} className="w-full md:w-auto">
              {deleting ? "Borrando…" : "Eliminar"}
            </Button>
          )}
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
        title="¿Eliminar esta pista?"
        message="La pista deja de mostrarse en la audioguía. Queda archivada."
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}