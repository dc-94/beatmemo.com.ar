"use server";

import { revalidatePath } from "next/cache";
import { cicloSchema } from "@/lib/validations/ciclos";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function upsertCiclo(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPSERT_CICLO", table: "ciclos" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const id = (formData.get("id") as string) || null;
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;

    const validated = cicloSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const payload = { nombre: validated.data.nombre, tipo: validated.data.tipo };

    const { data: saved, error } = id
      ? await supabase.from("ciclos").update(payload).eq("id", id).select("id").single()
      : await supabase.from("ciclos").insert(payload).select("id").single();

    if (error || !saved) {
      console.error("[DB ERROR CICLO]:", error);
      return { success: false, error: "No se pudo guardar el ciclo." };
    }

    await logAdminAction(id ? "UPDATE_CICLO" : "CREATE_CICLO", "ciclos", user.id, { email: user.email, nombre: payload.nombre }, saved.id);

    revalidatePath("/agenda");
    return { success: true, newId: saved.id };
  } catch (e) {
    console.error("[CICLO FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}

export async function deleteCiclo(id: string): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "DELETE_CICLO", table: "ciclos", targetId: id });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { count } = await supabase
      .from("eventos")
      .select("id", { count: "exact", head: true })
      .eq("ciclo_id", id);

    if (count && count > 0) {
      return { success: false, error: `No se puede eliminar: ${count} evento(s) usan este ciclo.` };
    }

    const { error } = await supabase.from("ciclos").delete().eq("id", id);
    if (error) {
      console.error("[DB ERROR DELETE CICLO]:", error);
      return { success: false, error: "No se pudo eliminar." };
    }

    await logAdminAction("DELETE_CICLO", "ciclos", user.id, { email: user.email }, id);
    revalidatePath("/agenda");
    return { success: true };
  } catch (e) {
    console.error("[DELETE CICLO FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}