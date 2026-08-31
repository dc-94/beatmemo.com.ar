// src/lib/validations/config-sitio.ts
import { z } from "zod";

const horarioItem = z.object({
  dias: z.string().trim().min(1, "Poné los días"),
  horario: z.string().trim().min(1, "Poné el horario"),
});

const museoVisitasSchema = z.object({
  guia_gratuita: z.object({
    dia:  z.string().trim().max(40).default("Domingos"),
    hora: z.string().trim().max(20).default("11:00"),
    nota: z.string().trim().max(120).default("Sin reserva previa."),
  }),
  escuelas: z.object({
    reservas_modo:    z.enum(["activas", "mensaje"]).default("activas"),
    mensaje:          z.string().trim().max(500).default(""),
    mostrar_whatsapp: z.boolean().default(true),
    idiomas_nota:     z.string().trim().max(120).default("Disponible en Inglés y Español."),
  }).superRefine((d, ctx) => {
    if (d.reservas_modo === "mensaje" && !d.mensaje) {
      ctx.addIssue({ code: "custom", path: ["mensaje"], message: "Poné el mensaje de aviso para las escuelas" });
    }
  }),
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
  rooftop_url: z.string().trim().default(""),
  museo_visitas: museoVisitasSchema,
}).superRefine((data, ctx) => {
  if (data.banner_activo && !data.banner_mensaje) {
    ctx.addIssue({ code: "custom", path: ["banner_mensaje"], message: "Poné el mensaje del banner" });
  }
});

export type ConfigSitioInput = z.infer<typeof configSitioSchema>;