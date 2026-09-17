import { publicClient } from "@/lib/supabase/public";
import AudioguiaPlayer from "@/components/audioguia/AudioguiaPlayer";
import { getSiteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Audioguía · Museo Beatmemo",
  description: "Recorré la historia de The Beatles año por año, a tu ritmo.",
  robots: "noindex", 
};
export default async function AudioguiaPage() {
  const [tracksRes, config] = await Promise.all([
    publicClient
      .from("audioguia_tracks")
      .select("id, titulo, descripcion, imagen_url, audio_url, orden")
      .eq("activo", true).eq("is_deleted", false)
      .order("orden", { ascending: true }).order("id"),
    getSiteConfig(),
  ]);
  const tracks = tracksRes.data;

  if (!tracks || tracks.length === 0) {
    return (
      <div className="min-h-screen bg-brand-black-100 flex items-center justify-center text-center px-6">
        <p className="text-brand-white-300">La audioguía estará disponible pronto.</p>
      </div>
    );
  }

  interface Visita { label: string; detalle: string; href: string; }
  const visitas: Visita[] = [];
  const mv = config?.museo_visitas;
  if (mv?.guia_gratuita) {
    visitas.push({
      label: "Free Tour",
      detalle: `${mv.guia_gratuita.dia ?? ""} ${mv.guia_gratuita.hora ?? ""}`.trim(),
      href: "/museo/visitas-guiadas",
    });
  }
  if (mv?.escuelas && mv.escuelas.reservas_modo === "activas") {
    visitas.push({ label: "Escuelas", detalle: "Reservá tu visita", href: "/museo/visitas-guiadas" });
  }

  return <AudioguiaPlayer tracks={tracks} visitas={visitas} whatsappLink={config?.whatsapp_numero ?? ""} />;
}