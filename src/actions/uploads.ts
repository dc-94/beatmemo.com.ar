// src/actions/uploads.ts
"use server";

import cloudinary from "@/lib/cloudinary";
import { guardAction } from "@/lib/guard";

// Allowlist en runtime. El tipo se deriva de la constante, no al revés:
// así no pueden divergir.
const ALLOWED_FOLDERS = ["shows", "cocina", "cocktails", "banners", "general"] as const;
type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Detecta el formato real leyendo los primeros bytes del archivo.
 * file.type es un dato provisto por el cliente: no es evidencia de nada.
 */
function detectImageType(buffer: Buffer): "jpeg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(PNG_SIG)) return "png";

  // WEBP: "RIFF" [4 bytes de tamaño] "WEBP"
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) return "webp";

  return null;
}

export async function uploadImageToCloudinary(
  formData: FormData,
  folderName: UploadFolder = "general"
): Promise<string> {
  try {
    // 1. SESIÓN + RATE LIMIT (preset upload: 8/min, no 30) + ROL
    //    Mantengo el contrato de throw para no tocar CloudinaryWidget.
    const guard = await guardAction({
      intent: "UPLOAD_IMAGE",
      table: "cloudinary",
      limit: "upload",
    });
    if (!guard.ok) throw new Error(guard.response.error ?? "No autorizado.");

    // 2. ANTI-TAMPERING: allowlist en runtime.
    //    Rechazo en vez de caer a "general": un default silencioso oculta el ataque.
    if (!(ALLOWED_FOLDERS as readonly string[]).includes(folderName)) {
      console.warn(`[upload] Carpeta inválida "${folderName}" de ${guard.user.id}`);
      throw new Error("Destino de subida inválido.");
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Error("No se encontró ningún archivo para subir.");
    }

    // 3. TAMAÑO: antes de leer el buffer, no después.
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `El archivo pesa ${(file.size / 1024 / 1024).toFixed(2)}MB. El máximo es ${MAX_FILE_SIZE_MB}MB.`
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. MAGIC BYTES: el formato real, no el que declara el navegador.
    const realType = detectImageType(buffer);
    if (!realType) {
      console.warn(
        `[upload] Magic bytes inválidos de ${guard.user.id}. El browser declaró: ${file.type}`
      );
      throw new Error("El archivo no es una imagen JPG, PNG o WEBP válida.");
    }

    // 5. SUBIDA
    return await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `beatmemo/${folderName}`,
          format: "webp",
          quality: "auto",
          resource_type: "image", // explícito: nunca 'raw' ni 'auto'
        },
        (error, result) => {
          if (error || !result) {
            console.error("[upload] Error de Cloudinary:", error);
            reject(new Error("Falló la subida a Cloudinary."));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("[upload] Error crítico:", error);
    throw error;
  }
}