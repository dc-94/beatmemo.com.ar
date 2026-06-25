// src/components/home/AgendaWrapper.tsx
import { getUpcomingShows } from "@/actions/shows"; 
import AgendaPreview from "./AgendaPreview";

export default async function AgendaWrapper() {
  
  const shows = await getUpcomingShows();
  
  return <AgendaPreview shows={shows} />;
}