// src/components/home/HeroSection.tsx
import { getSiteContent } from "@/lib/site-content";
import { getUpcomingShows } from "@/actions/shows";
import { getSiteConfig } from "@/lib/site-config";
import { publicClient } from "@/lib/supabase/public";
import { isPromoVigente, type PromoData } from "@/lib/promo-helpers";
import HeroSectionView, { type TickerItem } from "./HeroSectionView";

function hoyAr(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

// fecha/hora ya son wall-clock AR: NO reconvertir zona. Formateo literal.
function formatWhen(fecha: string, hora: string, hoy: string): string {
  const hh = (hora ?? "").slice(0, 5);
  if (fecha === hoy) return `Hoy · ${hh}`;
  const dia = new Date(`${fecha}T12:00:00Z`).toLocaleDateString("es-AR", {
    weekday: "short", day: "numeric", timeZone: "America/Argentina/Buenos_Aires",
  });
  return `${dia} · ${hh}`;
}

export default async function HeroSection() {
  const [c, showsRes, config, promosRes] = await Promise.all([
    getSiteContent("home_hero"),
    getUpcomingShows(),
    getSiteConfig(),
    publicClient
      .from("promociones")
      .select("tipo,titulo,descripcion,entidad,imagen_url,logo_url,alt_texto,dias_semana,fecha_desde,fecha_hasta,activo")
      .eq("is_deleted", false)
      .eq("activo", true),
  ]);

  const hoy = hoyAr();
  const items: TickerItem[] = [];

  // Shows reales. LIVE TODAY el de hoy; el resto, LIVE.
  if (showsRes.ok && showsRes.data.length > 0) {
    const s = showsRes.data[0];
    items.push({
      when: formatWhen(s.fecha, s.hora, hoy),
      text: s.titulo,
      tag: s.ciclos?.nombre ?? undefined,
      live: s.fecha === hoy ? "today" : "soon",
    });
  }

  // Guía gratuita (siempre presente → el ticker nunca queda vacío, sin mock).
  const g = config.museo_visitas.guia_gratuita;
  items.push({ when: `${g.dia} ${g.hora} hs`, text: "Free Tour del Museo", tag: "Entrada libre" });

  // Promos vigentes hoy (misma regla que el resto del sitio).
  const promos = (promosRes.data as PromoData[] | null) ?? [];
  for (const p of promos) {
    if (isPromoVigente(p)) items.push({ when: p.entidad ?? "Beneficio", text: p.titulo });
  }

  return (
    <HeroSectionView
      titulo={c?.titulo ?? "El lugar Beatle en Rosario."}
      eyebrow={c?.subtitulo ?? "Rosario · Bv. Oroño 107 bis"}
      bajada={c?.cuerpo ?? "Museo, pub y escenario. Un homenaje a The Beatles en el corazón de Rosario."}
      tickerItems={items}
    />
  );
}