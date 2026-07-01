"use server";

import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations/eventos"; // Debes crear este archivo
import { revalidatePath } from "next/cache";

export async function createEvento(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Validar datos
  const rawData = Object.fromEntries(formData);
  const validated = eventSchema.safeParse(rawData);
  
  if (!validated.success) return { error: "Datos inválidos" };

  // 2. Insertar en DB
  const { error } = await supabase.from('eventos').insert(validated.data);
  
  if (error) return { error: "Error al guardar en DB" };

  revalidatePath('/admin/eventos');
  return { success: true };
}