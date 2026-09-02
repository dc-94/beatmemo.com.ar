"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function LogsFiltersToggle({ hayFiltro, children }: { hayFiltro: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(hayFiltro); // si ya venís filtrando, arranca abierto

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex items-center gap-2 px-3 py-2 rounded border text-sm transition-colors ${
          open ? "border-brand-red text-white" : "border-neutral-800 text-neutral-300 hover:border-neutral-700"
        }`}
      >
        <Search size={16} /> Buscar / filtrar
        {hayFiltro && !open && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-red ring-2 ring-neutral-950" aria-label="Filtros activos" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}