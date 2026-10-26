import { z } from "zod";

export const tipoEventoSchema = z.object({
  titulo_strong: z.string().trim().min(1, "Falta el título").max(40),
  titulo_light:  z.string().trim().max(40).default(""),
  descripcion:   z.string().trim().max(400).default(""),
  imagenes:      z.array(z.string().url()).min(3, "Mínimo 3 imágenes").max(6, "Máximo 6 imágenes"),
  orden:         z.coerce.number().int().min(0).default(0),
  activo:        z.boolean().default(true),
});

export const reorderTiposSchema = z
  .array(z.object({ id: z.string().uuid(), orden: z.number().int().min(0).max(999) }))
  .min(1).max(200);

export type TipoEventoInput = z.infer<typeof tipoEventoSchema>;