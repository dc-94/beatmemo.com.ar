// src/actions/upload.ts
"use server";

import cloudinary from "@/lib/cloudinary";

// Definimos los destinos permitidos para mantener el orden estricto en tu Cloudinary
type UploadFolder = "shows" | "cocina" | "cocktails" | "banners" | "general";

/**
 * Sube una imagen a Cloudinary en la carpeta dinámica especificada.
 */
export async function uploadImageToCloudinary(
  formData: FormData, 
  folderName: UploadFolder = "general"
): Promise<string> {
  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("No se encontró ningún archivo para subir.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          // AQUÍ ESTÁ LA MAGIA: La carpeta se asigna y se crea dinámicamente
          folder: `beatmemo/${folderName}`, 
          format: "webp",
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
    throw error;
  }
}