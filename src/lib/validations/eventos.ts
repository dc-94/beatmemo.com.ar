// src/lib/validations/eventos.ts
import { z } from "zod";

export const eventSchema = z.object({
  tipo: z.enum(["SHOW", "EVENTO_CULTURAL"]),
  titulo: z.string().min(3, "El título es obligatorio"),
  ciclo_id: z.string().uuid("Selecciona un ciclo válido"),
  fecha: z.string().min(1, "Fecha requerida"),
  hora: z.string().min(1, "Hora requerida"),
  descripcion: z.string().min(10, "Descripción mínima 10 caracteres"),
  es_gratuito: z.boolean().default(false),
  precio: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().nullable().optional()
  ),
  image_url: z.string().url("Imagen obligatoria"),
});