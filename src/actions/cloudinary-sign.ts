// src/actions/cloudinary-sign.ts
"use server";

import cloudinary from "@/lib/cloudinary";
import { guardAction } from "@/lib/guard";

// Carpetas permitidas: el cliente NO elige libre dónde subir, solo estas.
// Evita que se firmen uploads a rutas arbitrarias.
const CARPETAS_OK = new Set([
  "beatmemo/shows", "beatmemo/pub", "beatmemo/whisky",
  "beatmemo/promos", "beatmemo/espacio", "beatmemo/hero",
]);

interface FirmaResult {
  ok: boolean;
  error?: string;
  data?: { signature: string; timestamp: number; folder: string; apiKey: string; cloudName: string };
}

export async function firmarUpload(folder: string): Promise<FirmaResult> {
  // Solo un admin autenticado puede pedir una firma (reusa tu guardián).
  const guard = await guardAction({ intent: "SIGN_UPLOAD", table: "cloudinary" });
  if (!guard.ok) return { ok: false, error: "No autorizado." };

  if (!CARPETAS_OK.has(folder)) {
    return { ok: false, error: "Carpeta no permitida." };
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Firma SOLO los parámetros que Cloudinary va a recibir. El secret nunca sale.
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    ok: true,
    data: {
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    },
  };
}