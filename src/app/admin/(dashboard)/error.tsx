// src/app/admin/(dashboard)/error.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logClientError } from "@/actions/log-client-error";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Error boundary /admin]:", error);
    logClientError(error.message || "Error en panel", error.digest, "/admin");
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-xl font-bold text-white mb-2">Error en el panel</h1>
      <p className="text-neutral-400 max-w-md mb-2 text-sm">Algo falló al cargar esta sección. Ya quedó registrado.</p>
      {error.digest && <p className="text-neutral-600 text-xs mb-6 font-mono">Ref: {error.digest}</p>}
      <div className="flex gap-3">
        <button onClick={() => router.back()} className="border border-white/20 text-white px-5 py-2.5 rounded font-semibold text-sm hover:bg-white/5 transition">
          Volver
        </button>
      </div>
    </div>
  );
}