import { getTiposEventoPublicos } from "@/lib/rooftop-tipos-evento";
import TiposEvento from "./TiposEvento";

export default async function TiposEventoWrapper() {
  const tipos = await getTiposEventoPublicos();
  return <TiposEvento tipos={tipos} />;
}