// src/components/agenda/FullAgendaWrapper.tsx
import { getShowsByView } from "@/actions/shows";
import AgendaGrid from "./AgendaGrid";
import { whatsappLink } from "@/lib/config";


interface WrapperProps {
  view: string;
  year?: string;
  mes?: string;
}

// TODO: cuando exista lib/config.ts (ítem "WhatsApp hardcodeado" del mapa),
// este número sale de ahí. Por ahora, coherente con el resto del codebase.
const WHATSAPP_URL = whatsappLink("Hola! Quiero consultar por los próximos shows de Beatmemo.");

export default async function FullAgendaWrapper({ view, year, mes }: WrapperProps) {
  const result = await getShowsByView(
    view as "past" | "current" | "next",
    year,
    mes
  );

  // ── ESTADO 1: FALLO DE DATOS ──────────────────────────────────────────────
  // Honesto: no inventamos shows ni decimos "no hay nada" (sería mentira).
  // La página sigue en pie, el usuario tiene una salida de conversión real.
  if (!result.ok) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-6">
        <p className="font-serif text-2xl text-brand-white-100">
          La cartelera está tomando un descanso.
        </p>
        <p className="text-brand-white-300 text-sm max-w-md">
          No pudimos cargar los shows en este momento. Reintentá en unos
          minutos, o escribinos y te contamos la programación al instante.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-red-100 text-brand-white-100 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-red-200 rounded-sm transition-colors"
        >
          Consultar por WhatsApp
        </a>
      </div>
    );
  }

  // ── ESTADO 2: VACÍO REAL ──────────────────────────────────────────────────
  // Ahora sí, este mensaje es verdad: la query funcionó y no hay eventos.
  if (result.data.length === 0) {
    return (
      <p className="text-center text-brand-white-200 py-12">
        No hay shows programados para este período.
      </p>
    );
  }

  // ── ESTADO 3: DATOS ───────────────────────────────────────────────────────
  return <AgendaGrid shows={result.data as any} />;
}