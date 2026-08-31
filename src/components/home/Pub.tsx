// src/components/home/Pub.tsx
import { publicClient } from "@/lib/supabase/public";
import { getSiteContent } from "@/lib/site-content";
import PubUI, { type PubItem } from "./PubUI";

// Shuffle determinístico por ventana horaria. Vive en el SERVER: el orden se
// calcula una vez, se serializa y el cliente NO lo recalcula → sin hydration
// mismatch. (Antes vivía en PubUI con Date.now() en el cliente: esa era la
// causa real del flip Cocina↔Coctelería.)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function Pub() {
  const [pubRes, contenido] = await Promise.all([
    publicClient
      .from("pub")
      .select(
        "id, nombre, categoria, descripcion, url_imagen, es_vegetariano, es_vegano, es_sin_tacc, es_nuevo, es_recomendado, hero_destacado"
      )
      .eq("is_deleted", false)
      .eq("disponible", true)
      .eq("destacado_home", true)
      .order("orden", { ascending: true })
      .order("id", { ascending: true }) // desempate determinista
      .limit(7),
    getSiteContent("home_pub"),
  ]);

  const { data, error } = pubRes;

  if (error) {
    console.error("[DATA_ERROR][Pub.home]", JSON.stringify(error));
    try {
      await publicClient.rpc("log_system_error", {
        p_message: `[Pub.home] ${error.message}`,
        p_stack: error.details ?? null,
        p_dedup_key: `pub:home:${error.code ?? "UNKNOWN"}`,
      });
    } catch { /* el logueo nunca rompe el render */ }
  }

  const items = (data ?? []) as PubItem[];
  const heroItem = items.find((i) => i.hero_destacado) ?? items[0] ?? null;
  const others = heroItem ? items.filter((i) => i.id !== heroItem.id) : [];
  const windowSeed = Math.floor(Date.now() / (1000 * 60 * 60)); // rota por hora al revalidar
  const rest = seededShuffle(others, windowSeed);

  return <PubUI hero={heroItem} rest={rest} contenido={contenido} />;
}