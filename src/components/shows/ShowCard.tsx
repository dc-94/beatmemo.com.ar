// src/components/shows/ShowCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Show } from "@/types/database.types";

export default function ShowCard({ show }: { show: Show }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formateo de fechas
  const dateObj = new Date(show.fecha_hora);
  const formattedDateCard = dateObj.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  const formattedDateFull = dateObj.toLocaleDateString("es-AR", { weekday: 'long', day: "numeric", month: "long", year: 'numeric' });

  // Lógica de "Live Tonight" (Checkeo de hoy)
  const todayString = new Date().toISOString().split('T')[0];
const showDateString = new Date(show.fecha_hora).toISOString().split('T')[0];
const isTonight = todayString === showDateString;

  return (
    <>
      {/* TARJETA: Fondo negro absoluto y bordes rojos */}
      <article 
        onClick={() => setIsModalOpen(true)}
        className="relative bg-black border border-brand-red-100/20 shadow-lg cursor-pointer hover:border-brand-red-100/60 transition-all duration-300 overflow-hidden flex flex-col group"
      >
        {/* Chip "Tonight Live" */}
        {isTonight && (
          <div className="absolute top-4 left-4 z-20 bg-brand-red-100 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-md">
            Live Tonight
          </div>
        )}

        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <Image 
            src={show.url_imagen} 
            alt={show.banda} 
            fill 
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
          />
        </div>
        
        <div className="p-6 flex flex-col items-center text-center">
          <div className="flex gap-2 items-center mb-2">
            <span className="text-brand-red-100 text-[10px] font-bold uppercase tracking-widest border-b border-brand-red-100 pb-0.5">
              {show.ciclo}
            </span>
            <span className="text-brand-white-300 text-[10px] uppercase tracking-widest">
              • {formattedDateCard}
            </span>
          </div>
          
          <h3 className="font-serif font-bold text-2xl text-white mb-6">
            {show.banda}
          </h3>
          
          <button className="font-sans font-bold tracking-[0.2em] uppercase text-[11px] border-b-2 border-brand-red-100 pb-1 text-white hover:text-brand-red-100 transition-colors">
            Ver Detalles
          </button>
        </div>
      </article>

      {/* MODAL: Fondo negro absoluto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-black w-full max-w-lg shadow-2xl flex flex-col overflow-hidden border border-brand-red-100/30">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-white hover:text-brand-red-100 z-20 text-xl"
            >
              ✕
            </button>

            <div className="relative aspect-video w-full">
              <Image src={show.url_imagen} alt={show.banda} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <h3 className="absolute bottom-4 left-6 font-serif font-bold text-3xl text-white">
                {show.banda}
              </h3>
            </div>

            <div className="p-8 flex flex-col gap-6 text-white">
              {/* Info Técnica con Fecha */}
              <div className="flex justify-between items-center border-b border-brand-red-100/20 pb-4">
                <span className="text-brand-red-100 font-bold tracking-widest uppercase text-xs">
                  {show.ciclo}
                </span>
                <span className="text-white text-xs font-medium tracking-wide">
                  {formattedDateFull}
                </span>
              </div>

              {/* Descripción e Integrantes */}
              <div className="flex flex-col gap-4">
                <p className="text-gray-300 text-sm leading-relaxed">{show.descripcion}</p>
                {show.integrantes && (
                  <div className="bg-[#0f0f0f] p-4 border-l-2 border-brand-red-100">
                    <span className="block text-brand-red-100 text-[10px] uppercase tracking-widest font-bold mb-1">
                      Integrantes
                    </span>
                    <p className="text-sm font-light text-white">{show.integrantes}</p>
                  </div>
                )}
                {/* Costo Extra */}
                <div className="text-sm text-gray-400">
                  <span className="uppercase text-[10px] tracking-widest">Valor espectáculo:</span>
                  <span className="ml-2 font-bold text-white">${show.valor_espectaculo || show.precio}</span>
                </div>
              </div>

              {/* Botón de Reserva Rojo */}
              <a 
                href={`https://wa.me/5493412023737?text=Hola,%20quisiera%20reservar%20una%20mesa%20para%20${encodeURIComponent(show.banda)}`}
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