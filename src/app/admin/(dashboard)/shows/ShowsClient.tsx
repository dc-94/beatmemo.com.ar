"use client";


import { useState } from "react";
import { Settings2 } from "lucide-react";
import EventDrawer from "@/components/admin/EventDrawer";
import CiclosDrawer from "@/components/admin/CiclosDrawer";
import { getOptimizedImageUrl } from "@/lib/utils";

export default function ShowsClient({ shows, ciclos: ciclosIniciales }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [ciclosOpen, setCiclosOpen] = useState(false);

  const [ciclos, setCiclos] = useState(ciclosIniciales ?? []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterCiclo, setFilterCiclo] = useState("");

  const filteredShows = shows.filter((show: any) => {
    const matchesSearch = show.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo ? show.tipo === filterTipo : true;
    const matchesCiclo = filterCiclo ? show.ciclo_id === filterCiclo : true;
    
    return matchesSearch && matchesTipo && matchesCiclo;
  });


  const getNombreCiclo = (id: string | null) => {
    if (!id) return "Sin ciclo";
    const ciclo = ciclos.find((c: any) => c.id === id);
    return ciclo ? ciclo.nombre : "Desconocido";
  };

  const formatearFecha = (fechaDb: string) => {
    if (!fechaDb) return "";
    const [year, month, day] = fechaDb.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleEdit = (show: any) => {
    setEventToEdit(show);
    setIsOpen(true);
  };

  const handleCreateNew = () => {
    setEventToEdit(null);
    setIsOpen(true);
  };

return (
    <div className="w-full min-h-screen space-y-6 flex flex-col">
       {/* Header  */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Shows y Eventos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCiclosOpen(true)}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm"
          >
            <Settings2 size={16} /> Gestionar ciclos
          </button>
          <button
            onClick={() => { setEventToEdit(null); setIsOpen(true); }}
            className="bg-brand-red hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm"
          >
            + Nuevo evento
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS (Optimizada para Móvil y Desktop) */}
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        
        {/* Buscador de texto */}
        <input 
          type="text"
          placeholder="Buscar evento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:flex-1 bg-neutral-950 border border-neutral-800 text-white p-3 rounded focus:border-brand-red outline-none transition"
        />

        {/* Filtro por Tipo */}
        <select 
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="w-full sm:w-48 bg-neutral-950 border border-neutral-800 text-white p-3 rounded focus:border-brand-red outline-none"
        >
          <option value="">Todos los tipos</option>
          <option value="SHOW">Shows / Conciertos</option>
          <option value="EVENTO_CULTURAL">Culturales</option>
        </select>

        {/* Filtro por Ciclo */}
        <select 
          value={filterCiclo}
          onChange={(e) => setFilterCiclo(e.target.value)}
          className="w-full sm:w-48 bg-neutral-950 border border-neutral-800 text-white p-3 rounded focus:border-brand-red outline-none"
        >
          <option value="">Todos los ciclos</option>
          {ciclos.map((c: any) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* GRID DE RESULTADOS */}
      {filteredShows.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-neutral-400 text-lg">No se encontraron eventos con estos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredShows.map((show: any) => (
            <div 
              key={show.id} 
              onClick={() => handleEdit(show)} 
              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition cursor-pointer hover:scale-[1.02] duration-200"
            >
              {/* Imagen (Usando la utilidad optimizada) */}
              <div 
                className="h-48 w-full bg-cover bg-center bg-neutral-800"
                style={{ backgroundImage: `url(${getOptimizedImageUrl(show.url_imagen)})` }}
              />
              
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xl font-bold text-white leading-tight">{show.titulo}</h3>
                  <span className="bg-neutral-800 text-xs px-2 py-1 rounded text-neutral-300 whitespace-nowrap">
                    {show.tipo === 'SHOW' ? '🎸 Show' : '🎭 Cultural'}
                  </span>
                </div>

                <p className="text-brand-red text-sm font-semibold uppercase tracking-wider">
                  {getNombreCiclo(show.ciclo_id)}
                </p>

                <div className="flex flex-col text-sm text-neutral-400 space-y-1 pt-2 border-t border-neutral-800">
                  <span>📅 {formatearFecha(show.fecha)}</span>
                  <span>🎟️ {show.es_gratuito || !show.precio ? "Gratuito" : `$${show.precio}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAWER POLIMÓRFICO (Crear / Editar) */}
      <EventDrawer 
      key={eventToEdit?.id ?? "new"}
        ciclos={ciclos} 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setEventToEdit(null); // Limpiamos al cerrar
        }} 
        eventToEdit={eventToEdit} // Le pasamos los datos si estamos editando
      />
      <CiclosDrawer
        isOpen={ciclosOpen}
        onClose={() => setCiclosOpen(false)}
        ciclos={ciclos}
        onCiclosChange={setCiclos}
      />
    </div>
  );
}