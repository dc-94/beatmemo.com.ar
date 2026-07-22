"use client";

import { useState } from "react";
import Image from "next/image";
import { isToday } from "@/utils/date"; 
import { getOptimizedImageUrl } from "@/lib/utils";
import { whatsappLink, WA_MESSAGES } from "@/lib/config";

// Ya no usamos Show de database.types porque el JOIN altera la forma del objeto.
// Usaremos any momentáneamente, o puedes importar PublicEvent de tus actions.
export default function ShowCard({ show }: { show: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Unificamos fecha y hora (Ej: '2024-05-20' + 'T' + '21:00:00')
  const fechaHoraCombinada = `${show.fecha}T${show.hora}`;
  const dateObj = new Date(fechaHoraCombinada);
  
  // Formateo de fechas adaptado
  const formattedDateCard = dateObj.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  const formattedDateFull = dateObj.toLocaleDateString("es-AR", { weekday: 'long', day: "numeric", month: "long", year: 'numeric' });
  
  // Extracción segura del nombre del ciclo tras el JOIN de Supabase
  const nombreCiclo = show.ciclos?.nombre || "Música en Vivo";

  // Lógica de "Live Tonight" (pasamos la fecha combinada)
  const isTonight = isToday(fechaHoraCombinada);

  // Optimización de la imagen
  const optimizedUrl = getOptimizedImageUrl(show.url_imagen);

  return (
    <>
      <article 
        onClick={() => setIsModalOpen(true)}
        className="relative bg-black border border-brand-red-100/20 shadow-lg cursor-pointer hover:border-brand-red-100/60 transition-all duration-300 overflow-hidden flex flex-col group"
      >
        {isTonight && (
          <div className="absolute top-4 left-4 z-20 bg-brand-red-100 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-md">
            Live Tonight
          </div>
        )}

        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <Image 
            src={optimizedUrl} 
            alt={show.titulo} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
          />
        </div>
        
        <div className="p-6 flex flex-col items-center text-center">
          <div className="flex gap-2 items-center mb-2">
            <span className="text-brand-red-100 text-[10px] font-bold uppercase tracking-widest border-b border-brand-red-100 pb-0.5">
              {nombreCiclo}
            </span>
            <span className="text-brand-white-300 text-[10px] uppercase tracking-widest">
              • {formattedDateCard}
            </span>
          </div>
          
          <h3 className="font-serif font-bold text-2xl text-white mb-6">
            {show.titulo}
          </h3>
          
          <button className="font-sans font-bold tracking-[0.2em] uppercase text-[11px] border-b-2 border-brand-red-100 pb-1 text-white hover:text-brand-red-100 transition-colors">
            Ver Detalles
          </button>
        </div>
      </article>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-black w-full max-w-lg shadow-2xl flex flex-col overflow-hidden border border-brand-red-100/30 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-white hover:text-brand-red-100 z-20 text-xl"
            >
              ✕
            </button>

            <div className="relative aspect-video w-full">
              <Image src={optimizedUrl} alt={show.titulo} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <h3 className="absolute bottom-4 left-6 font-serif font-bold text-3xl text-white">
                {show.titulo}
              </h3>
            </div>

            <div className="p-8 flex flex-col gap-6 text-white max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-brand-red-100/20 pb-4">
                <span className="text-brand-red-100 font-bold tracking-widest uppercase text-xs">
                  {nombreCiclo}
                </span>
                <div className="text-right">
                  <span className="block text-white text-xs font-medium tracking-wide">
                    {formattedDateFull}
                  </span>
                  <span className="block text-gray-400 text-[10px] uppercase tracking-widest mt-1">
                    {show.hora.slice(0, 5)} HS
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{show.descripcion}</p>
                
                {show.integrantes && (
                  <div className="bg-[#0f0f0f] p-4 border-l-2 border-brand-red-100">
                    <span className="block text-brand-red-100 text-[10px] uppercase tracking-widest font-bold mb-1">
                      Integrantes
                    </span>
                    <p className="text-sm font-light text-white whitespace-pre-line">{show.integrantes}</p>
                  </div>
                )}
                
                <div className="text-sm text-gray-400 border-t border-brand-red-100/20 pt-4 mt-2">
                  <span className="uppercase text-[10px] tracking-widest">Valor espectáculo:</span>
                  <span className="ml-2 font-bold text-white text-base">
                    {show.es_gratuito || !show.precio ? "GRATUITO" : `$${show.precio}`}
                  </span>
                </div>
              </div>

              <a href={whatsappLink(WA_MESSAGES.reservaShow(show.titulo))}           // ShowCard

                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-center bg-brand-red-100 text-white font-sans font-bold tracking-[0.2em] uppercase text-xs py-4 hover:bg-brand-red-200 transition-colors w-full"
              >
                Reservar Mesa
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}