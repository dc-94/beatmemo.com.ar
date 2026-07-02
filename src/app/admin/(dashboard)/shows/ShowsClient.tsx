"use client";
import { useState } from "react";
import EventDrawer from "@/components/admin/EventDrawer";
import { Show, Ciclo } from "@/types/database.types"; // Ajusta el import
import { getOptimizedImageUrl } from "@/lib/utils";

interface ShowsClientProps {
  shows: Show[];
  ciclos: Ciclo[];
}

export default function ShowsClient({ shows, ciclos }: ShowsClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredShows = shows.filter((show) =>
    show.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Función auxiliar para encontrar el nombre del ciclo
  const getNombreCiclo = (id: string | null) => {
    if (!id) return "Sin ciclo asignado";
    const ciclo = ciclos.find((c) => c.id === id);
    return ciclo ? ciclo.nombre : "Ciclo desconocido";
  };

  // Función auxiliar para formatear la fecha a formato latino (DD/MM/YYYY)
  const formatearFecha = (fechaDb: string) => {
    if (!fechaDb) return "";
    const [year, month, day] = fechaDb.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8">
      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Eventos</h1>
          <p className="text-neutral-400">Administra los shows y eventos culturales</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)} 
          className=" border border-brand-red-100 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded transition"
        >
          + Nuevo Evento
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <input 
          type="text"
          placeholder="Buscar por título de evento o banda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded focus:border-brand-red outline-none transition"
        />
      </div>

      {/* GRID DE RESULTADOS */}
      {filteredShows.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-neutral-400 text-lg">No se encontraron eventos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShows.map((show) => (
            <div key={show.id} className="bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden hover:border-neutral-700 transition">
              {/* Imagen (Usamos un div con background para mantener la proporción) */}
              <div 
                className="h-38 w-full bg-cover bg-center bg-neutral-800"
                style={{ backgroundImage: `url(${getOptimizedImageUrl(show.url_imagen)})` }}
              />
              {/* Contenido de la tarjeta */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-md font-bold text-white leading-tight">{show.titulo}</h3>
                   <span className="bg-neutral-800 text-xs px-2 py-1 rounded text-neutral-300 whitespace-nowrap">
                    {show.tipo === 'SHOW' ? '🎸 Show' : '🎭 Cultural'}
                  </span>
                </div>

                <p className="text-brand-red text-xs font-semibold uppercase tracking-wider">
                  {getNombreCiclo(show.ciclo_id)}
                </p>

                <div className="flex flex-col text-sm text-neutral-400 space-y-1 pt-2 border-t border-neutral-800">
                  <span>📅 {formatearFecha(show.fecha)}</span>
                  <span>⏰ {show.hora.slice(0, 5)} hs</span> {/* Cortamos los segundos (ej: 21:00:00 -> 21:00) */}
                  <span>
                    🎟️ {show.es_gratuito || !show.precio ? "Gratuito" : `$${show.precio}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAWER PORTAL */}
      <EventDrawer 
        ciclos={ciclos} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}