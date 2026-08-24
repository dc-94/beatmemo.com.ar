// src/components/admin/CiclosDrawer.tsx
"use client";

import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import CiclosManager from "./CiclosManager";

interface Ciclo { id: string; nombre: string; tipo: string; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ciclos: Ciclo[];
  onCiclosChange: (ciclos: Ciclo[]) => void;
}

export default function CiclosDrawer({ isOpen, onClose, ciclos, onCiclosChange }: Props) {
  const drawerRef = useDrawerA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div ref={drawerRef} className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[40%] bg-neutral-950 border-l border-neutral-800 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Gestionar ciclos</h2>
          <button onClick={onClose} className="text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <CiclosManager ciclos={ciclos} onCiclosChange={onCiclosChange} />
        </div>
      </div>
    </>
  );
}