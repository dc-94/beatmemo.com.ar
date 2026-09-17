// src/actions/audioguia-uploads.ts
"use server";

import { logAdminAction } from "@/lib/admin-logger";
import { guardAction } from "@/lib/guard";

const MAX_BYTES = 20 * 1024 * 1024;   // 20MB — un audio de museo puede ser largo
const BUCKET = "audioguia";

// Magic bytes de audio: MP3 con ID3 ("ID3") o frame MPEG (0xFF 0xFB/0xF3/0xF2).
// No confiamos en file.type (lo controla el cliente).
function isRealAudio(buffer: Buffer): boolean {
  if (buffer.length < 3) return false;
  // "ID3"
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true;
  // MPEG frame sync (0xFF Ex/Fx)
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true;
  return false;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadAudioguiaTrack(formData: FormData, slug: string): Promise<UploadResult> {
  try {
    const guard = await guardAction({ intent: "UPLOAD_AUDIOGUIA", table: "audioguia_tracks", limit: "upload" });
    if (!guard.ok) return { success: false, error: guard.response.error };
    const { supabase, user } = guard;

    const file = formData.get("file");
    if (!(file instanceof File)) return { success: false, error: "No se encontró ningún archivo." };

    if (file.size > MAX_BYTES) {
      return { success: false, error: `El audio pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. El máximo es 20MB.` };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isRealAudio(buffer)) return { success: false, error: "El archivo no es un MP3 válido." };

    // Slug para el nombre del archivo.
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!safeSlug) return { success: false, error: "Identificador inválido." };
    const path = `${safeSlug}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: "audio/mpeg", upsert: true, cacheControl: "3600" });

    if (uploadError) {
      console.error("[STORAGE ERROR audioguia]:", uploadError);
      return { success: false, error: "Falló la subida del audio." };
    }

    await logAdminAction("UPLOAD_AUDIOGUIA", "audioguia_tracks", user.id,
      { email: user.email, slug: safeSlug, size_mb: +(file.size / 1024 / 1024).toFixed(2) }, null);

    // URL pública + cache-bust por timestamp (el bucket sirve por CDN).
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { success: true, url: `${pub.publicUrl}?t=${Date.now()}` };
  } catch (error) {
    console.error("[UPLOAD AUDIOGUIA FATAL]:", error);
    return { success: false, error: "Error inesperado al subir el audio." };
  }
}