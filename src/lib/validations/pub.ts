// src/lib/validations/pub.ts
import { z } from "zod";

export const pubItemSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es obligatorio" }),

  categoria: z.string().min(1, { message: "Selecciona una categoría" }),

  descripcion: z.string().optional(),

  // Puede ser nulo (ej: promos sin precio fijo). coerce convierte el string del form.
  precio: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo")
    .nullable()
    .optional(),

  url_imagen: z.string().url({ message: "La URL de la imagen no es válida" }),

  // Atributos booleanos (multi-selección). Default false para que nunca lleguen undefined.
  es_vegetariano: z.boolean().default(false),
  es_vegano: z.boolean().default(false),
  es_sin_tacc: z.boolean().default(false),
  es_nuevo: z.boolean().default(false),
  es_recomendado: z.boolean().default(false),
  
  // Control de visibilidad y orden
  destacado_home: z.boolean().default(false),
  disponible: z.boolean().default(true),
  orden: z.coerce.number().int().default(0),

  // tags es text[] en la DB. El form manda un string separado por comas;
  // acá lo normalizamos a array de strings limpios.
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      const arr = Array.isArray(val) ? val : val.split(",");
      return arr.map((t) => t.trim()).filter((t) => t.length > 0);
    }),
});

export type PubItemInput = z.infer<typeof pubItemSchema>;