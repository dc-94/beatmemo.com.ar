// src/components/layout/SplashLoader.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashLoader() {
  const [show, setShow] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Ya lo vio: desmontar sin animación.
    if (document.documentElement.dataset.splash === "seen") {
      setShow(false);
      return;
    }

    document.cookie = "loader_visto=true; path=/; max-age=86400";

    const fadeTimer = setTimeout(() => setIsFading(true), 600);
    const removeTimer = setTimeout(() => setShow(false), 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      id="splash-overlay"
      className={`fixed inset-0 z-[100] bg-[#1A1A1A] flex items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative w-48 h-12 md:w-56 md:h-16 animate-pulse">
        <Image
          src="/brand/logo_BLANCO.svg"
          alt="Cargando ..."
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}