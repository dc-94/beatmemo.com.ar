// src/components/home/Pub.tsx
import { publicClient } from "@/lib/supabase/public";
import PubUI from "./PubUI";

export default async function Pub() {
  // Lectura pública sin cookies: no fuerza render dinámico del home.
  const { data, error } = await publicClient
    .from("pub")
    .select(
      "id, nombre, categoria, descripcion, url_imagen, es_vegetariano, es_vegano, es_sin_tacc, es_nuevo, es_recomendado, hero_destacado"
    )
    .eq("is_deleted", false)      
    .eq("disponible", true)
    .eq("destacado_home", true)   
    .order("orden", { ascending: true }) 
    .limit(7);

  if (error) {
    // Mismo patrón que shows.ts: log persistente, nunca tumba la respuesta.
    console.error("[DATA_ERROR][Pub.home]", JSON.stringify(error));
    try {
      await publicClient.rpc("log_system_error", {
        p_message: `[Pub.home] ${error.message}`,
        p_stack: error.details ?? null,
        p_dedup_key: `pub:home:${error.code ?? "UNKNOWN"}`,
      });
    } catch { /* el logueo nunca rompe el render */ }
  }

  // Sin items destacados: PubUI oculta la grilla y muestra solo el bloque
  // editorial. Estado vacío honesto — nada inventado.
  return <PubUI items={data ?? []} />;
}