// src/lib/validations/hero-slides.ts
import { z } from "zod";

// Un slide = imagen + palabra, indivisibles. Ese pareo es lo que garantiza
// "misma cantidad de imágenes que de palabras": no existen por separado.
const slideSchema = z.object({
  imagen: z
    .string()
    .trim()
    .refine((v) => v.startsWith("/") || v.startsWith("https://"), {
      message: "La imagen debe ser una ruta interna (/) o una URL https://",
    }),
  palabra: z
    .string()
    .trim()
    .min(1, "La palabra no puede estar vacía")
    .max(30, "Máximo 30 caracteres"),
});

export const heroSlidesSchema = z
  .array(slideSchema)
  .min(1, "Tiene que haber al menos 1 slide")
  .max(4, "Máximo 4 slides");

export type HeroSlide = z.infer<typeof slideSchema>;
export type HeroSlides = z.infer<typeof heroSlidesSchema>;