// src/components/rooftop/Descubri.tsx  (Server Component)
import Image from "next/image";
import RevealSection from "@/components/pub/RevealSection";
import { getDescubriPublico } from "@/lib/rooftop-galeria";

// Span según la forma de la foto: ancha → 2 columnas, alta → 2 filas, cuadrada → 1×1.
function spanClass(ancho: number, alto: number): string {
  if (!ancho || !alto) return "";
  const r = ancho / alto;
  if (r >= 1.3) return "col-span-2";
  if (alto / ancho >= 1.3) return "row-span-2";
  return "";
}

export default async function Descubri() {
  const data = await getDescubriPublico();
  if (data.fotos.length === 0) return null;  // sin fotos cargadas → sección oculta

  return (
    <section id="descubri" className="bg-[#141211] py-14 sm:py-20 lg:py-28">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10">
        <RevealSection>
          <p className="font-extrabold text-[0.72rem] tracking-[0.26em] uppercase text-[#8a8378] mb-2">
            {data.subtitulo}
          </p>
          <h2 className="font-extrabold text-[clamp(1.9rem,5.5vw,3.1rem)] tracking-tight uppercase leading-[0.95] text-white">
            {data.titulo}
          </h2>
        </RevealSection>

        <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 auto-rows-[clamp(120px,22vw,190px)] grid-flow-row-dense">
          {data.fotos.map((f) => (
            <figure key={f.id} className={`relative overflow-hidden rounded-lg group ${spanClass(f.ancho, f.alto)}`}>
              <Image
                src={f.imagen_url}
                alt={f.subtitulo || "Espacio del rooftop"}
                fill
                sizes="(min-width:768px) 25vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              {f.subtitulo && (
                <figcaption className="absolute inset-x-0 bottom-0 p-3 text-white text-sm font-medium bg-gradient-to-t from-black/70 to-transparent">
                  {f.subtitulo}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}