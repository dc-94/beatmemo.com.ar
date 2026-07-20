// src/lib/validations/promociones.ts
import { z } from "zod";

const diasSchema = z
  .union([z.string(), z.array(z.union([z.string(), z.number()])), z.undefined(), z.null()])
  .transform((val) => {
    if (!val) return [] as number[];
    const arr = Array.isArray(val) ? val : String(val).split(",");
    return arr
      .map((d) => parseInt(String(d).trim(), 10))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
  });

const fechaOpcional = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v === "" || v === undefined || v === null ? null : v))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: "Fecha inválida (formato AAAA-MM-DD)",
  });

// z.url() ahora es top-level en v4, no z.string().url(). Envuelto en union
// con "" para permitir campo vacío.
const urlOpcional = z.union([z.url("URL inválida"), z.literal("")]).default("");

export const promocionSchema = z
  .object({
    tipo: z.enum(["banco", "fecha_especial", "local"], {
      error: "Tipo inválido",
    }),
    titulo: z.string().min(2, "El título es obligatorio"),
    descripcion: z.string().default(""),
    entidad: z.string().default(""),

    logo_url: urlOpcional,
    imagen_url: urlOpcional,
    alt_texto: z.string().default(""),

    dias_semana: diasSchema,
    fecha_desde: fechaOpcional,
    fecha_hasta: fechaOpcional,

    activo: z.boolean().default(true),
    prioridad: z.coerce.number().int().min(0).max(999).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "banco" && !data.entidad.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["entidad"],
        message: "Para una promo de banco, la entidad es obligatoria.",
      });
    }
    if (data.fecha_desde && data.fecha_hasta && data.fecha_hasta < data.fecha_desde) {
      ctx.addIssue({
        code: "custom",
        path: ["fecha_hasta"],
        message: "La fecha de fin no puede ser anterior a la de inicio.",
      });
    }
  });

export type PromocionInput = z.infer<typeof promocionSchema>;