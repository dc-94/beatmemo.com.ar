import { z } from "zod";

// Encabezado de sección (reusable: servicios ahora; hero/descubri después)
export const seccionRooftopSchema = z.object({
  clave:      z.enum(["servicios", "hero", "descubri"]),
  titulo:     z.string().trim().max(120).default(""),
  subtitulo:  z.string().trim().max(200).default(""),
  cuerpo:     z.string().trim().max(2000).default(""),
  imagen_url: z.string().trim().default(""),
  cta_label:  z.string().trim().max(40).default(""),
  cta_url:    z.string().trim().refine(
    (v) => v === "" || v.startsWith("/") || v.startsWith("#") || v.startsWith("https://"),
    { message: "El link debe empezar con /, # o https://" }
  ).default(""),
  imagenes:   z.array(z.string().url()).max(6).default([]),   // hero: 3–6 (mín. se controla en la UI)
});

// Ítem de la lista de servicios
export const servicioSchema = z.object({
  texto:   z.string().trim().min(1, "Falta el texto").max(80),
  detalle: z.string().trim().max(120).default(""),   // el gris
  orden:   z.coerce.number().int().min(0).default(0),
  activo:  z.boolean().default(true),
});

export const reorderSchema = z
  .array(z.object({ id: z.string().uuid(), orden: z.number().int().min(0).max(999) }))
  .min(1).max(200);

export type ServicioInput = z.infer<typeof servicioSchema>;