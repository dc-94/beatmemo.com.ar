// src/components/agenda/AgendaScrollHint.tsx
// Al entrar a la agenda, un desplazamiento sutil para asomar la primera fila
// de cards. Respeta prefers-reduced-motion (no se mueve si el usuario lo pidió).
"use client";

import { useEffect } from "react";

export default function AgendaScrollHint() {
  useEffect(() => {
    // Si el usuario pidió menos movimiento, no auto-scrolleamos.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Solo si está arriba de todo (no interrumpimos si ya scrolleó).
    if (window.scrollY > 0) return;

    const t = setTimeout(() => {
      // Un desplazamiento suave y corto: asoma las cards sin saltar.
      window.scrollTo({ top: window.innerHeight * 0.28, behavior: "smooth" });
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return null;
}