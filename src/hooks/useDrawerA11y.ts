// src/hooks/useDrawerA11y.ts
// Accesibilidad de drawers: atrapa el foco adentro mientras está abierto
// (Tab no se va detrás del overlay) y cierra con Escape.
import { useEffect, useRef } from "react";

export function useDrawerA11y(isOpen: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const atraparFoco = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const focusables = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];

      // Shift+Tab en el primero → va al último; Tab en el último → va al primero.
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", cerrarConEscape);
    document.addEventListener("keydown", atraparFoco);
    // Al abrir, enfocamos el primer campo del drawer.
    const primerInput = ref.current?.querySelector<HTMLElement>("input, select, textarea, button");
    primerInput?.focus();

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.removeEventListener("keydown", atraparFoco);
    };
  }, [isOpen, onClose]);

  return ref;
}