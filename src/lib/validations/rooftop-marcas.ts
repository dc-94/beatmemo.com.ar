import { z } from "zod";

export const marcaSchema = z.object({
  logo_url: z.string().trim().min(1, "El logo es obligatorio"),
  nombre: z.string().trim().max(80).default(""),
  orden: z.coerce.number().int().min(0).default(0),
  activo: z.boolean().default(true),
});

export const reorderMarcasSchema = z
  .array(z.object({ id: z.string().uuid(), orden: z.number().int().min(0).max(999) }))
  .min(1).max(200);

export type MarcaInput = z.infer<typeof marcaSchema>;