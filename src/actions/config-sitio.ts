// src/actions/config-sitio.ts
"use server";

import { revalidatePath } from "next/cache";
import { configSitioSchema } from "@/lib/validations/config-sitio";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";

export async function updateConfigSitio(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPDATE_CONFIG", table: "config_sitio" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.banner_activo = raw.banner_activo === "true" || raw.banner_activo === "on";
    // horarios viaja como JSON string desde el form; lo parseamos.
    try {
      raw.horarios = raw.horarios ? JSON.parse(raw.horarios as string) : [];
    } catch {
      return { success: false, error: "Los horarios tienen un formato inválido." };
    }

    const validated = configSitioSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: "Revisá los campos.", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const d = validated.data;
    const payload = {
      telefono_intl: d.telefono_intl || null,
      whatsapp_numero: d.whatsapp_numero || null,
      horarios: d.horarios,
      instagram_url: d.instagram_url || null,
      facebook_url: d.facebook_url || null,
      google_review_url: d.google_review_url || null,
      banner_activo: d.banner_activo,
      banner_mensaje: d.banner_mensaje || null,
      banner_vence: d.banner_vence || null,
      rooftop_url: d.rooftop_url || null,
    };

    // UPDATE de la fila singleton (id=1). No se crea ni se borra.
    const { error } = await supabase.from("config_sitio").update(payload).eq("id", 1);
    if (error) {
      console.error("[DB ERROR CONFIG]:", error);
      return { success: false, error: "No se pudo guardar la configuración." };
    }

    await logAdminAction("UPDATE_CONFIG", "config_sitio", user.id, { email: user.email }, "1");

    // Revalida todo: el footer y el WhatsApp están en el layout, afectan todas las páginas.
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    console.error("[CONFIG FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}