// src/lib/validations/hh-lista.ts
import { z } from "zod";

// Lista de ítems de cobertura del HH. Strings cortos, sin vacíos, máx 12.
export const listaSchema = z
  .array(z.string().trim().min(1, "Ítem vacío").max(40, "Máximo 40 caracteres"))
  .max(12, "Máximo 12 ítems");

export type Lista = z.infer<typeof listaSchema>;