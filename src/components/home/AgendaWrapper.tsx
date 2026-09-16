// src/components/home/AgendaWrapper.tsx
import { getUpcomingShows } from "@/lib/shows-data";
import AgendaPreview, { type EventoConHoy } from "./AgendaPreview";

// "Hoy" en zona AR, calculado UNA vez en el server. Se serializa al HTML,
// así cliente y server hidratan con el mismo valor (sin mismatch).
function esHoyAr(fecha: string): boolean {
  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return fecha === hoy;
}

export default async function AgendaWrapper() {
  const result = await getUpcomingShows();

  if (!result.ok || result.data.length === 0) {
    return null;
  }

  const shows: EventoConHoy[] = result.data.map((s) => ({ ...s, esHoy: esHoyAr(s.fecha) }));

  return (
    <AgendaPreview
      shows={shows}
      whatsappNumero={process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? ""}
    />
  );
}