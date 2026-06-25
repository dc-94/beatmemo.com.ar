// src/components/agenda/AgendaGrid.tsx
import ShowCard from "@/components/shows/ShowCard";
import { Show } from "@/types/database.types";

export default function AgendaGrid({ shows }: { shows: Show[] }) {
  if (shows.length === 0) {
    return <p className="text-center text-brand-white-300 py-12">No hay shows programados para este período.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {shows.map((show: Show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}