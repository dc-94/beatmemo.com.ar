"use server";

import { revalidatePath } from "next/cache";
import { whiskySchema } from "@/lib/validations/whiskies";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function upsertWhisky(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({
      intent: "UPSERT_WHISKY",
      table: "whiskies",
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const id = (formData.get("id") as string) || null;

    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.tiene_hh = raw.tiene_hh === "true" || raw.tiene_hh === "on";
    raw.disponible = raw.disponible !== "false"; // default disponible

    const validated = whiskySchema.safeParse(raw);
    if (!validated.success) {
      return {
        success: false,
        error: "Revisá los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const payload = {
      marca: validated.data.marca,
      expresion: validated.data.expresion || null,
      coleccion: validated.data.coleccion,
      logo_url: validated.data.logo_url || null,
      tiene_hh: validated.data.tiene_hh,
      orden: validated.data.orden,
      disponible: validated.data.disponible,
    };

    const { data: saved, error } = id
      ? await supabase.from("whiskies").update(payload).eq("id", id).select("id").single()
      : await supabase.from("whiskies").insert(payload).select("id").single();

    if (error || !saved) {
      console.error("[DB ERROR WHISKY]:", error);
      return { success: false, error: "No se pudo guardar el whisky." };
    }

    await logAdminAction(
      id ? "UPDATE_WHISKY" : "CREATE_WHISKY",
      "whiskies",
      user.id,
      { email: user.email, marca: payload.marca },
      saved.id
    );

    revalidatePath("/pub");
    return { success: true };
  } catch (e) {
    console.error("[WHISKY FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}

export async function deleteWhisky(id: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({
      intent: "DELETE_WHISKY",
      table: "whiskies",
      targetId: id,
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // Soft delete, coherente con el resto del proyecto.
    const { error } = await supabase
      .from("whiskies")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) {
      console.error("[DB ERROR DELETE WHISKY]:", error);
      return { success: false, error: "No se pudo eliminar." };
    }

    await logAdminAction("SOFT_DELETE_WHISKY", "whiskies", user.id, { email: user.email }, id);
    revalidatePath("/pub");
    return { success: true };
  } catch (e) {
    console.error("[DELETE WHISKY FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}