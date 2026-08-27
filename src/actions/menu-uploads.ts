// src/actions/menu-uploads.ts
"use server";

import { logAdminAction } from "@/lib/admin-logger";
import { guardAction } from "@/lib/guard";

const MAX_BYTES = 10 * 1024 * 1024;        // 10 MB hard limit
const WARN_BYTES = 6 * 1024 * 1024;        // 6 MB → warning de performance móvil
const BUCKET = "menus";

// Magic bytes de un PDF real: "%PDF" = 0x25 0x50 0x44 0x46.
// No confiamos en file.type (el cliente lo controla): inspeccionamos el buffer.
function isRealPdf(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46    // F
  );
}

export interface UploadResult {
  success: boolean;
  url?: string;
  warning?: string;   // se muestra pero no bloquea (ej: PDF > 6MB)
  error?: string;
}

/**
 * Sube el PDF de una carta al bucket 'menus'.
 * @param formData - debe contener 'file' (el PDF)
 * @param slug     - nombre lógico de la carta (fullmenu, whisky, etc). Es el path del archivo.
 *
 * Reemplaza el archivo anterior del mismo slug (upsert). El cache-busting real
 * lo maneja la columna `version` de la tabla `menus` vía ?v=, no el nombre.
 */
export async function uploadMenuPdf(
  formData: FormData,
  slug: string
): Promise<UploadResult> {
  try {
    // 1. SESIÓN + RATE LIMIT (preset upload: 8/min — 10MB por request no
    //    puede tener el techo de 30/min de las mutaciones) + ROL.
    //    Antes esta action NO logueaba intentos no autorizados: era la única
    //    ruta donde un ataque no dejaba rastro en el trail. El guard lo cierra.
    const guard = await guardAction({
      intent: "UPLOAD_MENU_PDF",
      table: "menus",
      limit: "upload",
    });
    if (!guard.ok) {
      return { success: false, error: guard.response.error };
    }
    const { supabase, user } = guard;

    // 2. Archivo presente — instanceof, no `as`: si llega otra cosa,
    //    falla acá con mensaje claro, no tres líneas después con uno críptico.
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "No se encontró ningún archivo." };
    }

    // 3. Tamaño (hard limit) — antes de leer el buffer a memoria.
    if (file.size > MAX_BYTES) {
      return {
        success: false,
        error: `El PDF pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. El máximo es 10MB.`,
      };
    }

    // 4. Magic bytes: ¿es un PDF de verdad?
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isRealPdf(buffer)) {
      return { success: false, error: "El archivo no es un PDF válido." };
    }

    // 5. Slug seguro: solo minúsculas, números y guiones (evita path traversal)
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!safeSlug) {
      return { success: false, error: "Identificador de carta inválido." };
    }
    const path = `${safeSlug}.pdf`;

    // 6. Subir (upsert: reemplaza el archivo anterior del mismo slug)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: "application/pdf",
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("[STORAGE ERROR]:", uploadError);
      return { success: false, error: "Falló la subida del archivo." };
    }

    // 7. AUDITORÍA: un reemplazo de PDF es una mutación de contenido público.
    //    Antes no quedaba registro de QUIÉN subió QUÉ carta.
    await logAdminAction(
      "UPLOAD_MENU_PDF",
      "menus",
      user.id,
      { email: user.email, slug: safeSlug, size_mb: +(file.size / 1024 / 1024).toFixed(2) },
      null
    );

    // 8. URL pública (bucket público)
const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    // 9. Warning de performance (no bloquea): PDF pesado en móvil
    const warning =
      file.size > WARN_BYTES
        ? `El PDF pesa ${(file.size / 1024 / 1024).toFixed(1)}MB. Se recomienda menos de 6MB para carga rápida en móvil.`
        : undefined;

    return { success: true, url: pub.publicUrl, warning };
  } catch (error) {
    console.error("[UPLOAD MENU FATAL]:", error);
    return { success: false, error: "Error inesperado al subir el archivo." };
  }
}