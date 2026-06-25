// src/components/layout/SplashLoader.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SplashProps {
  hasSeenLoader: boolean;
}
export default function SplashLoader({ hasSeenLoader }: SplashProps) {
  // Ahora el servidor asume que SIEMPRE se va a mostrar (isUnmounted = false)
  const [isFading, setIsFading] = useState(false);
  const [show, setShow] = useState(!hasSeenLoader);

  useEffect(() => {
    if (!hasSeenLoader) {
      // Configuramos la cookie para el servidor (Válida por 1 día)
      document.cookie = "loader_visto=true; path=/; max-age=86400";

      const fadeTimer = setTimeout(() => setIsFading(true), 1500);
      const removeTimer = setTimeout(() => setShow(false), 2000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [hasSeenLoader]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#1A1A1A] flex items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative w-48 h-12 md:w-56 md:h-16 animate-pulse">
        <Image 
          src="/brand/logo_BLANCO.svg" 
          alt="Cargando Beatmemo..." 
          fill
          className="object-contain"
          priority 
        />
      </div>
    </div>
  );
}