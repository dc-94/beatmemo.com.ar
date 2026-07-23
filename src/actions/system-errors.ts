// src/actions/system-errors.ts
"use server";

import { revalidatePath } from "next/cache";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function marcarErrorResuelto(errorId: string): Promise<ActionResponse> {
  try {
    // Solo SUPERADMIN: los errores del sistema son información sensible.
    const guard = await guardAction({
      intent: "RESOLVE_SYSTEM_ERROR",
      table: "system_errors",
      targetId: errorId,
      roles: ["SUPERADMIN"],
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const { error } = await supabase
      .from("system_errors")
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
      })
      .eq("id", errorId);

    if (error) {
      console.error("[DB ERROR RESOLVE]:", error);
      return { success: false, error: "No se pudo marcar como resuelto." };
    }

    revalidatePath("/admin/errores");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("[RESOLVE ERROR FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}