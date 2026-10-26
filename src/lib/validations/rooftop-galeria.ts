
import { z } from "zod";

export const galeriaSchema = z.object({
  imagen_url: z.string().trim().min(1, "Falta la imagen"),
  subtitulo:  z.string().trim().max(120).default(""),
  ancho:      z.coerce.number().int().min(0).default(0),  // del upload → aspect ratio del bento
  alto:       z.coerce.number().int().min(0).default(0),
  orden:      z.coerce.number().int().min(0).default(0),
  activo:     z.boolean().default(true),
});

export const reorderGaleriaSchema = z
  .array(z.object({ id: z.string().uuid(), orden: z.number().int().min(0).max(999) }))
  .min(1).max(200);

export type GaleriaInput = z.infer<typeof galeriaSchema>;