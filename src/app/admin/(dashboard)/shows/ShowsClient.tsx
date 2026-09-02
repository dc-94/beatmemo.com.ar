"use client";

import { useState, useMemo } from "react";
import { Plus, Settings2, ChevronDown ,Search, X} from "lucide-react";
import EventDrawer from "@/components/admin/EventDrawer";
import CiclosDrawer from "@/components/admin/CiclosDrawer";
import { getOptimizedImageUrl } from "@/lib/utils";
import Button from "@/components/ui/Button";

// Agrupa por "YYYY-MM": mes en curso + futuros ascendente, pasados al final.
function agruparPorMes(shows: any[]) {
  const ahora = new Date();
  const claveActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  const grupos: Record<string, any[]> = {};
  for (const s of shows) {
    if (!s.fecha) continue;
    const clave = s.fecha.slice(0, 7);
    (grupos[clave] ||= []).push(s);
  }
  const claves = Object.keys(grupos);
  const futuras = claves.filter((c) => c >= claveActual).sort();
  const pasadas = claves.filter((c) => c < claveActual).sort().reverse();
  return [...futuras, ...pasadas].map((clave) => {
    const [y, m] = clave.split("-");
    const label = clave === claveActual
      ? "Este mes"
      : new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const items = [...grupos[clave]].sort((a, b) => (a.fecha + (a.hora ?? "")).localeCompare(b.fecha + (b.hora ?? "")));
    return { clave, label, items };
  });
}

export default function ShowsClient({ shows, ciclos: ciclosIniciales, userRole }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [ciclosOpen, setCiclosOpen] = useState(false);
  const [ciclos, setCiclos] = useState(ciclosIniciales ?? []);
  const [buscadorOpen, setBuscadorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterCiclo, setFilterCiclo] = useState("");

  const filteredShows = shows.filter((show: any) => {
    const matchesSearch = show.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo ? show.tipo === filterTipo : true;
    const matchesCiclo = filterCiclo ? show.ciclo_id === filterCiclo : true;
    return matchesSearch && matchesTipo && matchesCiclo;
  });
  
  const hayFiltro = Boolean(searchTerm || filterTipo || filterCiclo);

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFilterTipo("");
    setFilterCiclo("");
  };


  const grupos = useMemo(() => agruparPorMes(filteredShows), [filteredShows]);

  // Mes en curso abierto por default; si no tiene eventos, el primer grupo.
  const [abiertos, setAbiertos] = useState<Set<string>>(() => {
    const ahora = new Date();
    const claveActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
    const tieneActual = grupos.some((g) => g.clave === claveActual);
    return new Set([tieneActual ? claveActual : grupos[0]?.clave].filter(Boolean) as string[]);
  });
  const toggle = (clave: string) =>
    setAbiertos((prev) => {
      const next = new Set(prev);
      next.has(clave) ? next.delete(clave) : next.add(clave);
      return next;
    });

  const getNombreCiclo = (id: string | null) => {
    if (!id) return "Sin ciclo";
    const ciclo = ciclos.find((c: any) => c.id === id);
    return ciclo ? ciclo.nombre : "Desconocido";
  };

  const formatearFecha = (fechaDb: string) => {
    if (!fechaDb) return "";
    const [, month, day] = fechaDb.split("-");
    return `${day}/${month}`;
  };

  const handleEdit = (show: any) => { setEventToEdit(show); setIsOpen(true); };
  const handleCreateNew = () => { setEventToEdit(null); setIsOpen(true); };

  return (
    <div className="w-full min-h-screen space-y-5 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-white">Shows y Eventos</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setBuscadorOpen((v) => !v)}
            className={`relative ${buscadorOpen ? "!border-brand-red !text-white" : ""}`}
          >
            <Search size={16} /> Buscar
            {hayFiltro && !buscadorOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-red ring-2 ring-neutral-950" aria-label="Filtros activos" />
            )}
          </Button>
          <Button variant="secondary" onClick={() => setCiclosOpen(true)}>
            <Settings2 size={16} /> Ciclos
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus size={18} /> Nuevo
          </Button>
        </div>
      </div>

      {/* Filtros (colapsables) */}
      {buscadorOpen && (
        <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-3 sm:space-y-0 sm:flex sm:gap-3 sm:items-center animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            placeholder="Buscar evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full sm:flex-1 bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded focus:border-brand-red outline-none transition text-sm"
          />
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full sm:w-44 bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded focus:border-brand-red outline-none text-sm">
            <option value="">Todos los tipos</option>
            <option value="SHOW">Shows</option>
            <option value="EVENTO_CULTURAL">Culturales</option>
          </select>
          <select value={filterCiclo} onChange={(e) => setFilterCiclo(e.target.value)}
            className="w-full sm:w-44 bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded focus:border-brand-red outline-none text-sm">
            <option value="">Todos los ciclos</option>
            {ciclos.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {hayFiltro && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center justify-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors px-2 py-2 sm:py-0 whitespace-nowrap"
            >
              <X size={15} /> Limpiar
            </button>
          )}
        </div>
      )}

      {/* Meses */}
      {grupos.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-neutral-400">No se encontraron eventos con estos filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map(({ clave, label, items }) => {
            const abierto = abiertos.has(clave);
            return (
              <div key={clave} className="border border-neutral-800 rounded-lg overflow-hidden">
                <button onClick={() => toggle(clave)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900 hover:bg-neutral-800/60 transition-colors">
                  <span className="flex items-baseline gap-2.5">
                    <span className="font-bold text-white capitalize">{label}</span>
                    <span className="text-xs text-neutral-500">{items.length} evento{items.length !== 1 ? "s" : ""}</span>
                  </span>
                  <ChevronDown size={18} className={`text-neutral-400 transition-transform ${abierto ? "rotate-180" : ""}`} />
                </button>

                {abierto && (
                  <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-2.5 bg-neutral-950">
                    {items.map((show: any) => (
                      <button key={show.id} onClick={() => handleEdit(show)}
                        className="w-full flex items-center gap-3 p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 text-left transition">
                        <div className="w-14 h-14 rounded-md bg-neutral-800 bg-cover bg-center flex-none"
                          style={{ backgroundImage: `url(${getOptimizedImageUrl(show.url_imagen)})` }} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 whitespace-nowrap">
                              {show.tipo === "SHOW" ? "🎸 Show" : "🎭 Cultural"}
                            </span>
                            <span className="text-xs text-neutral-500">📅 {formatearFecha(show.fecha)}</span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate mt-1">{show.titulo}</p>
                          <p className="text-xs text-brand-red truncate">
                            {getNombreCiclo(show.ciclo_id)} ·
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Drawers */}
      <EventDrawer
        key={eventToEdit?.id ?? "new"}
        ciclos={ciclos}
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEventToEdit(null); }}
        eventToEdit={eventToEdit}
        userRole={userRole}
      />
      <CiclosDrawer isOpen={ciclosOpen} onClose={() => setCiclosOpen(false)} ciclos={ciclos} onCiclosChange={setCiclos} />
    </div>
  );
}