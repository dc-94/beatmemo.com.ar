// src/components/agenda/FullAgendaWrapper.tsx
import { getShowsByView } from "@/lib/shows-data";
import AgendaGrid from "./AgendaGrid";
import { getSiteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/config";

interface WrapperProps {
  view: string;
  year?: string;
  mes?: string;
}



export default async function FullAgendaWrapper({ view, year, mes }: WrapperProps) {
  const [result, config] = await Promise.all([
    getShowsByView(view as "past" | "current" | "next", year, mes),
    getSiteConfig(),
  ]);

const now = new Date();
  const tituloVista =
    view === "past" ? "Eventos anteriores"
    : view === "next" ? new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString("es-AR", { month: "long" })
    : "Este mes";
  const WHATSAPP_URL = whatsappLink("Hola! Quiero consultar por los próximos shows de Beatmemo.", config.whatsapp_numero);

  if (!result.ok) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-6">
        <p className="font-serif text-2xl text-brand-white-100">La cartelera está tomando un descanso.</p>
        <p className="text-brand-white-300 text-sm max-w-md">
          No pudimos cargar los shows en este momento. Reintentá en unos minutos, o escribinos y te contamos la programación al instante.
        </p>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="bg-brand-red-100 text-brand-white-100 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-red-200 rounded-sm transition-colors">
          Consultar por WhatsApp
        </a>
      </div>
    );
  }

  if (result.data.length === 0) {
    return <p className="text-center text-brand-white-200 py-12">No hay eventos programados para este período.</p>;
  }


   return (
    <>
      <AgendaGrid shows={result.data} whatsappNumero={config.whatsapp_numero} modoArchivo={view === "past"} />
    </>
  );
}