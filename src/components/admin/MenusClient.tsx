// src/components/admin/MenusClient.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, ArrowUp, ArrowDown, FileText, EyeOff, Pencil } from "lucide-react";
import MenuDrawer from "./MenuDrawer";
import { reorderMenus } from "@/actions/menus";

interface Menu {
  id: string;
  tipo: string;
  nombre: string;
  url_archivo: string;
  version: number;
  orden: number;
  activo: boolean;
}

interface Props {
  menus: Menu[];
}

export default function MenusClient({ menus: initialMenus }: Props) {
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Menu | undefined>(undefined);
  const [orderDirty, setOrderDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(undefined); setIsOpen(true); };
  const openEdit = (m: Menu) => { setEditing(m); setIsOpen(true); };

  // Mueve una carta una posición (arriba/abajo) SOLO en el estado local.
  // Nada se persiste hasta que el usuario toca "Guardar orden".
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= menus.length) return;
    const next = [...menus];
    [next[index], next[target]] = [next[target], next[index]];
    setMenus(next);
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    setSaving(true);
    // Reasignamos orden según la posición actual en la lista.
    const payload = menus.map((m, i) => ({ id: m.id, orden: i }));
    const res = await reorderMenus(payload);
    if (res.success) {
      toast.success("Orden guardado");
      setOrderDirty(false);
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cartas y Menús</h1>
          <p className="text-neutral-400 text-sm">{menus.length} cartas · se muestran en el visor QR</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm"
        >
          <Plus size={18} /> Nueva carta
        </button>
      </header>

      {/* Caption explicativo del reordenamiento */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
        <p className="text-neutral-400 text-xs">
          Usá las flechas para cambiar el orden de las cartas en el visor. Los cambios se aplican al guardar.
        </p>
        <button
          onClick={saveOrder}
          disabled={!orderDirty || saving}
          className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
            orderDirty && !saving
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-white/5 text-neutral-600 cursor-not-allowed"
          }`}
        >
          {saving ? "Guardando…" : "Guardar orden"}
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
          No hay cartas cargadas. Creá la primera con “Nueva carta”.
        </div>
      ) : (
        <div className="space-y-2">
          {menus.map((menu, index) => (
            <div
              key={menu.id}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              {/* Flechas de orden */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-neutral-500 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-500"
                  aria-label="Subir"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === menus.length - 1}
                  className="text-neutral-500 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-500"
                  aria-label="Bajar"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              <FileText className="text-amber-400 shrink-0" size={22} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{menu.nombre}</h3>
                  {!menu.activo && (
                    <span className="bg-neutral-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeOff size={10} /> Oculta
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 text-xs">
                  <code>{menu.tipo}</code> · versión {menu.version}
                </p>
              </div>

              <button
                onClick={() => openEdit(menu)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
              >
                <Pencil size={15} /> Editar
              </button>
            </div>
          ))}
        </div>
      )}

      <MenuDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        menuToEdit={editing}
      />
    </div>
  );
}