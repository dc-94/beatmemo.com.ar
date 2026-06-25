// src/components/agenda/FullAgendaWrapper.tsx
import { getShowsByView } from "@/actions/shows";
import AgendaGrid from "./AgendaGrid";

interface WrapperProps {
  view: string; // Añadimos esto
  year?: string;
  mes?: string;
}

export default async function FullAgendaWrapper({ view, year, mes }: WrapperProps) {
  // Ahora el tipado coincide y es escalable
  const shows = await getShowsByView(view as 'past' | 'current' | 'next', year, mes);
  
  if (!shows || shows.length === 0) {
    return <p className="text-center text-brand-white-200 py-12">No hay shows programados.</p>;
  }
  
  return <AgendaGrid shows={shows} />;
}