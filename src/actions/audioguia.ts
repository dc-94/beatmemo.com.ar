// src/actions/audioguia.ts
"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-logger";
import { z } from "zod";
import { guardAction, type ActionResponse } from "@/lib/guard";

const trackSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  descripcion: z.string().default(""),
  imagen_url: z.string().url("Falta la imagen").or(z.literal("")).default(""),
  audio_url: z.string().url("Falta subir el audio"),
  orden: z.coerce.number().int().default(0),
  activo: z.boolean().default(true),
});

const reorderSchema = z
  .array(z.object({ id: z.string().uuid(), orden: z.number().int().min(0).max(999) }))
  .min(1).max(100);

export async function upsertAudioguiaTrack(formData: FormData, id?: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: id ? "UPDATE_AUDIOGUIA" : "CREATE_AUDIOGUIA", table: "audioguia_tracks", targetId: id ?? null });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.activo = raw.activo === "true" || raw.activo === "on";

    const validated = trackSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos marcados.", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const query = id
      ? supabase.from("audioguia_tracks").update(validated.data).eq("id", id).select("id, titulo").single()
      : supabase.from("audioguia_tracks").insert(validated.data).select("id, titulo").single();

    const { data: saved, error } = await query;
    if (error) {
      console.error("[DB ERROR audioguia upsert]:", error);
      return { success: false, error: "Error al guardar la pista." };
    }

    await logAdminAction(id ? "UPDATE_AUDIOGUIA" : "CREATE_AUDIOGUIA", "audioguia_tracks", user.id,
      { email: user.email, titulo: saved?.titulo }, saved?.id ?? null);

    revalidatePath("/admin/audioguia");
    revalidatePath("/audioguia");
    return { success: true };
  } catch (error) {
    console.error("[AUDIOGUIA FATAL]:", error);
    return { success: false, error: "Error inesperado." };
  }
}

export async function deleteAudioguiaTrack(trackId: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_AUDIOGUIA", table: "audioguia_tracks", targetId: trackId });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase.from("audioguia_tracks").update({ is_deleted: true }).eq("id", trackId);
    if (error) return { success: false, error: "Error al eliminar la pista." };

    await logAdminAction("DELETE_AUDIOGUIA", "audioguia_tracks", user.id, { email: user.email }, trackId);
    revalidatePath("/admin/audioguia");
    revalidatePath("/audioguia");
    return { success: true };
  } catch (error) {
    console.error("[AUDIOGUIA FATAL]:", error);
    return { success: false, error: "Error inesperado al eliminar." };
  }
}

export async function reorderAudioguia(ordenados: { id: string; orden: number }[]): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "REORDER_AUDIOGUIA", table: "audioguia_tracks" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const validated = reorderSchema.safeParse(ordenados);
    if (!validated.success) return { success: false, error: "Datos de orden inválidos." };

    for (const item of validated.data) {
      const { error } = await supabase.from("audioguia_tracks").update({ orden: item.orden }).eq("id", item.id);
      if (error) return { success: false, error: "Error al guardar el orden." };
    }

    await logAdminAction("REORDER_AUDIOGUIA", "audioguia_tracks", user.id, { email: user.email, count: validated.data.length });
    revalidatePath("/admin/audioguia");
    revalidatePath("/audioguia");
    return { success: true };
  } catch (error) {
    console.error("[AUDIOGUIA FATAL]:", error);
    return { success: false, error: "Error inesperado al reordenar." };
  }
}