"use client";

import { useState, useEffect } from "react";
import PdfViewer from "./PdfViewer";

export default function MenuVersionPicker({
  urlDesktop, urlMovil, version, isQr,
}: {
  urlDesktop: string;
  urlMovil: string | null;
  version: number;
  isQr: boolean;
}) {
  // QR = siempre móvil (la ruta ya dice que vino de un teléfono).
  // Web = detectamos el dispositivo por CAPACIDAD, no por ancho.
  const [esMovil, setEsMovil] = useState<boolean | null>(isQr ? true : null);

  useEffect(() => {
    if (isQr) return; // QR ya resuelto a móvil
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    setEsMovil((coarse && noHover) || narrow);
  }, [isQr]);

  // Mientras resuelve (primer render en web), evitamos mostrar la versión equivocada.
  if (esMovil === null) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-neutral-100 rounded-sm">
        <span className="w-6 h-6 border-2 border-[#A68966]/40 border-t-[#A68966] rounded-full animate-spin" />
      </div>
    );
  }

  // Móvil con versión móvil disponible → esa. Si no hay móvil, fallback a desktop.
  const url = esMovil && urlMovil ? urlMovil : urlDesktop;
  return <PdfViewer url={url} version={version} />;
}