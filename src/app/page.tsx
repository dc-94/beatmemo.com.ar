import React from 'react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Un tag editorial delicado al estilo Beatmemo */}
        <span className="font-serif italic text-amber-500 tracking-widest text-xs uppercase block mb-3">
          Rosario, Argentina
        </span>
        
        {/* Título de impacto limpio */}
        <h1 className="text-4xl font-sans font-red tracking-tight uppercase mb-4">
          Beatmemo 2026
        </h1>
        
        <p className="text-sm text-zinc-400 font-light leading-relaxed">
          Navegación base inicializada con Next.js y Supabase. Próximamente: Cartelera de shows y plato sugerido.
        </p>
      </div>
    </main>
  )
}