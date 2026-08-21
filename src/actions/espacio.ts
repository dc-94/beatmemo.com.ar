// src/actions/espacio.ts
"use server";

import { revalidatePath } from "next/cache";
import { espacioSchema } from "@/lib/validations/espacio";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function upsertEspacio(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPSERT_ESPACIO", table: "espacio_galeria" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const id = (formData.get("id") as string) || null;
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.visible = raw.visible !== "false";

    const validated = espacioSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const payload = {
      imagen_url: validated.data.imagen_url,
      titulo: validated.data.titulo || null,
      epigrafe: validated.data.epigrafe || null,
      orden: validated.data.orden,
      visible: validated.data.visible,
    };

    const { data: saved, error } = id
      ? await supabase.from("espacio_galeria").update(payload).eq("id", id).select("id").single()
      : await supabase.from("espacio_galeria").insert(payload).select("id").single();

    if (error || !saved) {
      console.error("[DB ERROR ESPACIO]:", error);
      return { success: false, error: "No se pudo guardar." };
    }

    await logAdminAction(id ? "UPDATE_ESPACIO" : "CREATE_ESPACIO", "espacio_galeria", user.id, { email: user.email }, saved.id);
    revalidatePath("/pub");
    return { success: true };
  } catch (e) {
    console.error("[ESPACIO FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}

export async function deleteEspacio(id: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_ESPACIO", table: "espacio_galeria", targetId: id });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase.from("espacio_galeria").update({ is_deleted: true }).eq("id", id);
    if (error) { console.error("[DB ERROR DELETE ESPACIO]:", error); return { success: false, error: "No se pudo eliminar." }; }

    await logAdminAction("SOFT_DELETE_ESPACIO", "espacio_galeria", user.id, { email: user.email }, id);
    revalidatePath("/pub");
    return { success: true };
  } catch (e) {
    console.error("[DELETE ESPACIO FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}