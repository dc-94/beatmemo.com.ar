// src/app/not-found.tsx

"use client";
export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center bg-brand-black-100 px-6 py-16 text-center relative overflow-hidden">
      
      {/* Fondo tipográfico sutil */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="font-serif font-bold text-[15vw] tracking-tighter text-brand-white-100 whitespace-nowrap">
          NOWHERE LAND
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        
                {/* SVG: Abbey Road vacío */}
        <div className="text-brand-white-300/40 mb-8">
          <svg className="w-32 h-20 lg:w-40 lg:h-24" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Franjas del cruce peatonal en perspectiva */}
            <rect x="20" y="8" width="16" height="44" fill="currentColor" opacity="0.9" />
            <rect x="44" y="8" width="16" height="44" fill="currentColor" opacity="0.7" />
            <rect x="68" y="8" width="16" height="44" fill="currentColor" opacity="0.5" />
            <rect x="92" y="8" width="16" height="44" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        {/* Copywriting UX orientado a CX */}
        <h1 className="font-serif font-bold text-4xl lg:text-5xl text-brand-white-100 tracking-tight mb-4">
          ¡Help! I need somebody...
        </h1>
        
        <p className="font-sans text-brand-white-300 text-base lg:text-lg mb-10 max-w-lg">
          Parece que la página que buscás se quedó en Nowhere Land.
        </p>

        {/*  CX Recovery */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button
          onClick={() => window.history.back()}
          className="text-center bg-brand-red-100 text-brand-white-100 px-8 py-3.5 rounded-sm font-sans font-bold tracking-widest uppercase text-sm hover:bg-brand-red-200 transition-colors shadow-lg"
        >
          Volver atrás
        </button>
        </div>

      </div>
    </main>
  );
}