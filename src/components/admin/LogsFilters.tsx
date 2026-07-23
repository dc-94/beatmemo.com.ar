// src/components/admin/LogsFilters.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// Tipos de acción conocidos, para el dropdown. Derivados del trail real.
const ACTION_TYPES = [
  "", // todos
  "LOGIN_SUCCESS",
  "CREATE_SHOW", "UPDATE_SHOW", "SOFT_DELETE_SHOW", "HARD_DELETE_SHOW",
  "CREATE_PUB_ITEM", "UPDATE_PUB_ITEM", "SOFT_DELETE_PUB_ITEM",
  "CREATE_MENU", "UPDATE_MENU", "SOFT_DELETE_MENU", "REORDER_MENUS", "UPLOAD_MENU_PDF",
  "CREATE_PROMO", "UPDATE_PROMO", "SOFT_DELETE_PROMO",
];

export default function LogsFilters({
  currentAction,
  currentEmail,
  currentDesde,
  currentHasta,
}: {
  currentAction: string;
  currentEmail: string;
  currentDesde: string;
  currentHasta: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [email, setEmail] = useState(currentEmail);

  // Debounce del email: no dispara una query por cada tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      updateParam("email", email);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // cualquier filtro nuevo vuelve a la página 1
    router.push(`${pathname}?${next.toString()}`);
  }

  const inputCls =
    "bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded text-sm focus:border-brand-red outline-none";

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <select
        value={currentAction}
        onChange={(e) => updateParam("action", e.target.value)}
        className={inputCls}
      >
        {ACTION_TYPES.map((a) => (
          <option key={a} value={a}>{a === "" ? "Todas las acciones" : a}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Filtrar por email…"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputCls}
      />

      <input
        type="date"
        value={currentDesde}
        onChange={(e) => updateParam("desde", e.target.value)}
        className={`${inputCls} [color-scheme:dark]`}
        aria-label="Desde"
      />

      <input
        type="date"
        value={currentHasta}
        onChange={(e) => updateParam("hasta", e.target.value)}
        className={`${inputCls} [color-scheme:dark]`}
        aria-label="Hasta"
      />
    </div>
  );
}