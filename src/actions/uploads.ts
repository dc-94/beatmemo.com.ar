// src/actions/upload.ts
"use server";

import cloudinary from "@/lib/cloudinary";

type UploadFolder = "shows" | "cocina" | "cocktails" | "banners" | "general";

// Reglas de negocio y seguridad
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg","image/png", "image/webp"];

export async function uploadImageToCloudinary(
  formData: FormData, 
  folderName: UploadFolder = "general"
): Promise<string> {
  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("No se encontró ningún archivo para subir.");
    }

    // 1. HARDENING: Validación de Tipo de Archivo (Evitar Malware / SVG XSS)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Formato no permitido (${file.type}). Solo se aceptan JPG, PNG o WEBP.`);
    }

    // 2. HARDENING: Validación de Tamaño (Evitar Denial of Service)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). El máximo permitido es ${MAX_FILE_SIZE_MB}MB.`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: `beatmemo/${folderName}`, 
          format: "webp", // Forzamos siempre la conversión a webp por performance
          quality: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Error en Cloudinary:", error);
            reject(new Error("Falló la subida a Cloudinary"));
          } else {
            resolve(result!.secure_url);
          }
        }
      );

      uploadStream.end(buffer);
    });

  } catch (error) {
    console.error("Error crítico en uploadImageToCloudinary:", error);
    throw error; // Propagamos el error para que el frontend pueda mostrar un Toast/Alert
  }
}