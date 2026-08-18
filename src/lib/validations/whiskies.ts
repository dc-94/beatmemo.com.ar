import { z } from "zod";

export const COLECCIONES = ["blended","blended_malts","irish","single_malt","bourbon"] as const;

export const whiskySchema = z.object({
  marca: z.string().trim().min(1, "La marca es obligatoria").max(80),
  expresion: z.string().trim().max(80).default(""),
  coleccion: z.enum(COLECCIONES, { error: "Elegí una colección" }),
  logo_url: z.string().trim().default(""),
  tiene_hh: z.boolean().default(false),
  orden: z.coerce.number().int().min(0).default(0),
  disponible: z.boolean().default(true),
});

export type WhiskyInput = z.infer<typeof whiskySchema>;