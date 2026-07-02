import { z } from "zod";

export const eventSchema = z.object({
  tipo: z.string().min(1, "El tipo es obligatorio"),
  
  // Vuelve a ser 'titulo'
  titulo: z.string().min(2, { message: "El título es obligatorio" }), 
  
  // Solo exigimos el ID del ciclo, nada más
  ciclo_id: z.string().uuid({ message: "Selecciona un ciclo válido" }),
  
  fecha: z.string().min(1, { message: "Fecha requerida" }),
  hora: z.string().min(1, { message: "Hora requerida" }),
  descripcion: z.string().optional(),
  integrantes: z.string().optional(),
  es_gratuito: z.boolean().default(false),
  
  // Le decimos que es un número, pero que puede ser nulo o ignorado (.nullable().optional())
  precio: z.coerce.number().min(0, "El precio no puede ser negativo").nullable().optional(),
  
  url_imagen: z.string().url({ message: "La URL de la imagen no es válida" }),
});