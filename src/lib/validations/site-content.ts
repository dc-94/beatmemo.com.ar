// src/lib/validations/site-content.ts
import { z } from "zod";

// El CTA link acepta interno (/menu) o externo (https://...).
// Rechaza todo lo demás: un "menu" suelto no navega, y bloquea
// esquemas peligrosos (javascript:, data:) por no empezar con / o https://.
const ctaLinkSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || v.startsWith("/") || v.startsWith("https://"),
    { message: "El link debe empezar con / (interno) o https:// (externo)" }
  );

export const siteContentSchema = z.object({
  clave: z.enum([
    "pub", "museo", "agenda",
    "pub_cafe", "pub_ejecutivo", "pub_cocina", "pub_variedades",
    "pub_sello_1", "pub_sello_2", "pub_hh", "pub_barra", "pub_whisky",]),
  imagen_url: z.string().trim().default(""),
  alt_texto: z.string().trim().max(200, "Máximo 200 caracteres").default(""),
  titulo: z.string().trim().max(120).default(""),
  subtitulo: z.string().trim().max(200).default(""),
  cuerpo: z.string().trim().max(2000).default(""),
  cta_mostrar: z.boolean().default(false),
  cta_texto: z.string().trim().max(40).default(""),
  cta_link: ctaLinkSchema.default(""),
}).superRefine((data, ctx) => {
  // Si el CTA está activado, texto y link son obligatorios: un botón
  // visible sin texto o sin destino es un bug en la cara del visitante.
  if (data.cta_mostrar) {
    if (!data.cta_texto) {
      ctx.addIssue({ code: "custom", path: ["cta_texto"], message: "Poné el texto del botón" });
    }
    if (!data.cta_link) {
      ctx.addIssue({ code: "custom", path: ["cta_link"], message: "Poné el destino del botón" });
    }
  }
});

export type SiteContentInput = z.infer<typeof siteContentSchema>;