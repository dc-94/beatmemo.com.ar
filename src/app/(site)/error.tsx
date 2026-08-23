// src/app/(site)/error.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logClientError } from "@/actions/log-client-error";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Error boundary /site]:", error);
    // Persiste en system_errors para que aparezca en /admin/errores.
    const ruta = typeof window !== "undefined" ? window.location.pathname : undefined;
    logClientError(error.message || "Error desconocido", error.digest, ruta);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-brand-black-100">
      {/* Sutil: sin ilustración grande, solo tipografía y dos salidas discretas. */}
      <p className="text-[#C5A059] uppercase tracking-[0.34em] text-[11px] font-bold mb-3">
        Algo salió mal
      </p>
      <h1 className="font-serif text-2xl lg:text-3xl font-bold text-brand-white-100 mb-3">
        Se nos desafinó una cuerda
      </h1>
      <p className="text-brand-white-300 max-w-sm mb-8 text-sm leading-relaxed">
        Tuvimos un problema al cargar esto. Probá de nuevo o volvé a la página anterior.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="bg-[#C5A059] hover:bg-[#E6C987] text-black px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-colors"
        >
          Reintentar
        </button>
        {/* Vuelve a donde estaba, como pediste (router.back), no a un destino fijo. */}
        <button
          onClick={() => router.back()}
          className="border border-[#C5A059]/50 text-[#C5A059] px-6 py-2.5 font-bold uppercase tracking-widest text-xs hover:border-[#C5A059] transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
}