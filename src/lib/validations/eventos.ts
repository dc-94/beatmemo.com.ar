import { z } from "zod";

export const eventSchema = z.object({
titulo: z.string().trim().default(""),   // ya no min(1) directo
  tipo: z.enum(["SHOW", "EVENTO_CULTURAL"]).default("SHOW"),
  ciclo_id: z.string().uuid().optional().or(z.literal("")),
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
}).superRefine((data, ctx) => {
  // Un SHOW necesita título propio. Un cultural se identifica por su ciclo.
  if (data.tipo === "SHOW" && !data.titulo) {
    ctx.addIssue({ code: "custom", path: ["titulo"], message: "El título es obligatorio para un show" });
  }
  // Un cultural sin título Y sin ciclo no tendría cómo mostrarse.
  if (data.tipo === "EVENTO_CULTURAL" && !data.titulo && !data.ciclo_id) {
    ctx.addIssue({ code: "custom", path: ["ciclo_id"], message: "Elegí un ciclo o poné un título" });
  }
});