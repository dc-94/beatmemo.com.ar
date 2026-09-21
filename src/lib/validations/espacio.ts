// src/lib/validations/espacio.ts
import { z } from "zod";

export const espacioSchema = z.object({
  imagen_url: z.string().trim().min(1, "La imagen es obligatoria"),
  titulo: z.string().trim().max(80).default(""),
  epigrafe: z.string().trim().max(200).default(""),
  orden: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  mostrar_home: z.boolean().default(false),
  es_museo: z.boolean().default(false),
});

export type EspacioInput = z.infer<typeof espacioSchema>;