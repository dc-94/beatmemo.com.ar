// src/lib/validations/config-sitio.ts
import { z } from "zod";

const horarioItem = z.object({
  dias: z.string().trim().min(1, "Poné los días"),
  horario: z.string().trim().min(1, "Poné el horario"),
});

export const configSitioSchema = z.object({
  telefono_intl: z.string().trim().max(20).default(""),
  whatsapp_numero: z.string().trim().regex(/^\d*$/, "Solo números, sin + ni espacios").max(20).default(""),
  horarios: z.array(horarioItem).default([]),
  instagram_url: z.string().trim().default(""),
  facebook_url: z.string().trim().default(""),
  google_review_url: z.string().trim().default(""),
  banner_activo: z.boolean().default(false),
  banner_mensaje: z.string().trim().max(200).default(""),
  banner_vence: z.string().trim().default(""),
}).superRefine((data, ctx) => {
  // Si el banner está activo, el mensaje es obligatorio: una barra vacía
  // arriba del sitio es un bug visible.
  if (data.banner_activo && !data.banner_mensaje) {
    ctx.addIssue({ code: "custom", path: ["banner_mensaje"], message: "Poné el mensaje del banner" });
  }
});

export type ConfigSitioInput = z.infer<typeof configSitioSchema>;