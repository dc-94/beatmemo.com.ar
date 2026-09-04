// src/components/home/AgendaWrapper.tsx
import { getUpcomingShows } from "@/lib/shows-data";
import AgendaPreview from "./AgendaPreview";

export default async function AgendaWrapper() {
  const result = await getUpcomingShows();

  // DECISIÓN DE CX (deliberada, no accidental):
  // En el HOME, ante fallo de datos la sección desaparece en silencio.
  // - No mostramos error: un banner de fallo en la portada daña la marca
  //   más de lo que informa, y el home tiene otras secciones que sostienen
  //   la conversión (hero, pub, museo, FAB de WhatsApp siempre visible).
  // - No mostramos datos falsos: jamás.
  // - El error YA quedó logueado como [DATA_ERROR] en el server: la
  //   degradación es silenciosa para el usuario, ruidosa para nosotros.
  // En /agenda (destino dedicado) la política es distinta: error honesto
  // con CTA, porque ahí el usuario vino ESPECÍFICAMENTE a ver shows.
  if (!result.ok || result.data.length === 0) {
    return null; // AgendaPreview ya devolvía null con lista vacía; se preserva.
  }

  return (
    <AgendaPreview
      shows={result.data}
      whatsappNumero={process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? ""}
    />
  );
}