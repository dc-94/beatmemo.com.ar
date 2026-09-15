// src/actions/site-content.ts
"use server";

import { revalidatePath } from "next/cache";
import { siteContentSchema } from "@/lib/validations/site-content";
import { logAdminAction } from "@/lib/admin-logger";
import { guardAction, type ActionResponse } from "@/lib/guard";
import { heroSlidesSchema } from "@/lib/validations/hero-slides";
import { listaSchema } from "@/lib/validations/hh-lista";

// Mapea cada clave a la ruta que hay que revalidar tras editarla.
// Son páginas cacheadas (ISR): sin revalidate, el cambio no se ve hasta
// que expire el cache.
const RUTA_POR_CLAVE: Record<string, string> = {
  home_hero: "/", home_pub: "/", home_museo: "/", home_espacio: "/",
  pub: "/pub", museo: "/museo", agenda: "/agenda",
  pub_cafe: "/pub", pub_ejecutivo: "/pub", pub_cocina: "/pub",
  pub_variedades: "/pub", pub_sello_1: "/pub", pub_sello_2: "/pub",
  pub_hh: "/pub", pub_barra: "/pub", pub_whisky: "/pub", pub_espacio: "/pub",
};

export async function updateSiteContent(formData: FormData): Promise<ActionResponse> {
  try {
    const guard = await guardAction({
      intent: "UPDATE_SITE_CONTENT",
      table: "site_content",
      // SUPERADMIN + CM: usa el default ADMIN_ROLES, que ya incluye ambos.
    });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    // Los checkbox llegan como 'true'/'on'/ausente.
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    raw.cta_mostrar = raw.cta_mostrar === "true" || raw.cta_mostrar === "on";

    const validated = siteContentSchema.safeParse(raw);
    if (!validated.success) {
      return {
        success: false,
        error: "Revisá los campos marcados.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { clave, ...contenido } = validated.data;

    // UPDATE (no upsert): las filas ya existen por la semilla. Si la clave
    // no existe, el update afecta 0 filas y lo detectamos abajo.
    const { data: saved, error: dbError } = await supabase
      .from("site_content")
      .update(contenido)
      .eq("clave", clave)
      .select("clave")
      .single();

    if (dbError || !saved) {
      console.error("[DB ERROR SITE_CONTENT]:", dbError);
      return { success: false, error: "No se pudo guardar el contenido." };
    }

    await logAdminAction(
      "UPDATE_SITE_CONTENT",
      "site_content",
      user.id,
      { email: user.email, pagina: clave },
      clave
    );

    // Revalida la página editada Y el home (por si muestra algo de esa página).
    const ruta = RUTA_POR_CLAVE[clave];
    if (ruta) revalidatePath(ruta);
    revalidatePath("/");

    return { success: true };
  } catch (e) {
    console.error("[SITE_CONTENT FATAL]:", e);
    return { success: false, error: "Error inesperado." };
  }
}


export async function updateHeroSlides(slidesRaw: unknown): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPDATE_HERO_SLIDES", table: "site_content" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const parsed = heroSlidesSchema.safeParse(slidesRaw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Slides inválidos" };
    }

    const { data, error } = await supabase
      .from("site_content")
      .update({ slides: parsed.data })
      .eq("clave", "home_hero")
      .select("clave")
      .single();

    if (error || !data) {
      console.error("[HERO_SLIDES]", error);
      return { success: false, error: "No se pudieron guardar los slides." };
    }

    await logAdminAction("UPDATE_HERO_SLIDES", "site_content", user.id, { count: parsed.data.length }, "home_hero");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("[HERO_SLIDES FATAL]", e);
    return { success: false, error: "Error inesperado." };
  }
}

export async function updateLista(clave: string, listaRaw: unknown): Promise<ActionResponse> {
  try {
    const guard = await guardAction({ intent: "UPDATE_LISTA", table: "site_content" });
    if (!guard.ok) return guard.response;
    const { supabase, user } = guard;

    const parsed = listaSchema.safeParse(listaRaw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Lista inválida" };
    }

    const { data, error } = await supabase
      .from("site_content")
      .update({ lista: parsed.data })
      .eq("clave", clave)
      .select("clave")
      .single();

    if (error || !data) {
      console.error("[LISTA]", error);
      return { success: false, error: "No se pudo guardar la lista." };
    }

    await logAdminAction("UPDATE_LISTA", "site_content", user.id, { clave, count: parsed.data.length }, clave);
    const ruta = RUTA_POR_CLAVE[clave];
    if (ruta) revalidatePath(ruta);
    return { success: true };
  } catch (e) {
    console.error("[LISTA FATAL]", e);
    return { success: false, error: "Error inesperado." };
  }
}