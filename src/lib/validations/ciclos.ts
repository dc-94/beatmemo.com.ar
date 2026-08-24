import { z } from "zod";

// Mismos valores que eventos.tipo y el CHECK de ciclos.tipo.
export const TIPOS_CICLO = ["SHOW", "EVENTO_CULTURAL"] as const;

export const cicloSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  tipo: z.enum(TIPOS_CICLO, { error: "Elegí un tipo" }),
});

export type CicloInput = z.infer<typeof cicloSchema>;