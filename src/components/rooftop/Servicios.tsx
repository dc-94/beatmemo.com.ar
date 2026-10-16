// src/components/rooftop/Servicios.tsx  (Server Component)
import Image from "next/image";
import RevealSection from "@/components/pub/RevealSection";
import { SERVICIOS, SERVICIOS_IMAGEN, ROOFTOP_CAPACIDAD } from "@/lib/rooftop-data";

/**
 * "Servicios" (ex "Qué incluye"). Banda hueso para romper el blanco puro,
 * grilla a dos columnas con hairlines + foto en B&N (detalle) + capacidad.
 */
export default function Servicios() {
  return (
    <section id="servicios" className="bg-[#F5F1E9] py-14 sm:py-20 lg:py-28">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10">
        <RevealSection>
          <p className="font-extrabold text-[0.72rem] tracking-[0.26em] uppercase text-[#b4ac9c] mb-2">
            Todo incluido
          </p>
          <h2 className="font-extrabold text-[clamp(1.9rem,5.5vw,3.1rem)] tracking-tight uppercase leading-[0.95] text-[#141211]">
            Servicios
          </h2> 
        </RevealSection>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-10 items-center mt-7">
          <RevealSection>
            <ul className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-12">
              {SERVICIOS.map((s) => (
                <li
                  key={s.texto}
                  className="flex gap-3 items-baseline py-3.5 border-b border-[#E6E2D8] text-[0.95rem]"
                >
                  <span className="w-5 h-px bg-[#141211] flex-none relative -top-1.5" aria-hidden />
                  <span className="text-[#141211]">
                    <b className="font-semibold">{s.texto}</b>
                    {s.detalle && <span className="text-[#6d685f] font-normal"> — {s.detalle}</span>}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex gap-10 flex-wrap mt-7">
              <div>
                <div className="font-black text-[2.8rem] leading-none text-[#141211]">{ROOFTOP_CAPACIDAD.sentadas}</div>
                <div className="font-medium text-[0.78rem] tracking-[0.1em] uppercase text-[#6d685f]">Sentadas</div>
              </div>
              <div>
                <div className="font-black text-[2.8rem] leading-none text-[#141211]">{ROOFTOP_CAPACIDAD.lunch}</div>
                <div className="font-medium text-[0.78rem] tracking-[0.1em] uppercase text-[#6d685f]">Formato lunch</div>
              </div>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={SERVICIOS_IMAGEN}
                alt="El espacio del rooftop"
                fill
                sizes="(min-width:1024px) 30vw, 90vw"
                className="object-cover grayscale contrast-[1.02]"
              />
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
