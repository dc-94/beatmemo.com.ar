import { z } from "zod";

export const eventSchema = z.object({
  tipo: z.string().min(1, "El tipo es obligatorio"),
  titulo: z.string().min(2, { message: "El título es obligatorio" }),
  ciclo_id: z.string().uuid({ message: "Selecciona un ciclo válido" }),
  fecha: z.string().min(1, { message: "Fecha requerida" }),
  hora: z.string().min(1, { message: "Hora requerida" }),

  // .default("") en vez de .optional(): si el usuario vacía el campo,
  // el "" tiene que LLEGAR a la base y sobrescribir. Con .optional() la
  // clave desaparecía del output de Zod y el UPDATE no tocaba la columna.
  descripcion: z.string().default(""),
  integrantes: z.string().default(""),

  es_gratuito: z.boolean().default(false),

  // "" (gratuito o campo vacío) → null explícito, no 0.
  // Sin este preprocess, z.coerce.number() convierte "" en 0.
  precio: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.coerce.number().min(0, "El precio no puede ser negativo").nullable()
  ),

  url_imagen: z.string().url({ message: "La URL de la imagen no es válida" }),
});