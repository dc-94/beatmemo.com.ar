// src/components/rooftop/Cotizador.tsx  (Server Component)
import { whatsappLink } from "@/lib/config";
import MarcasCarrusel from "./MarcasCarrusel";
import RooftopWordmarkLetters from "./RooftopWordmarkLetters";
import { ROOFTOP_WHATSAPP } from "@/lib/rooftop-data";

export default function Cotizador() {
  return (
    <section className="relative overflow-hidden bg-[#Fafafa] pt-20 sm:pt-28 pb-12 text-center">
      <div className="relative z-10 max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10">
        <p className="font-extrabold text-[0.72rem] tracking-[0.26em] uppercase text-[#b4ac9c] mb-2">Reservá tu fecha</p>
        <h2 className="font-black text-[clamp(2.2rem,8vw,4.6rem)] uppercase tracking-tight leading-none text-[#141211] mb-4">
          Cotizá tu <span className="font-extralight">evento</span>
        </h2>
        <p className="text-[#6d685f] max-w-[42ch] mx-auto mb-8">Contanos qué tenés en mente y armamos una propuesta a tu medida.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="#cotizar" className="bg-[#141211] text-white px-8 py-3.5 uppercase tracking-[0.14em] font-bold text-[0.76rem] hover:bg-black transition">Pedir cotización</a>
          <a href={whatsappLink("Hola! Quiero consultar por eventos en Beatmemo Rooftop.", ROOFTOP_WHATSAPP)} target="_blank" rel="noopener noreferrer" className="border border-[#141211] text-[#141211] px-8 py-3.5 uppercase tracking-[0.14em] font-bold text-[0.76rem] hover:bg-[#141211] hover:text-white transition">WhatsApp directo</a>
        </div>
        <MarcasCarrusel />
      </div>
    </section>
  );
}