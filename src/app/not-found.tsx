// src/app/not-found.tsx
import Link from "next/link";

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
        
        {/* SVG: Vinilo Roto (LCP Optimizado, sin peticiones de red) */}
        <div className="text-brand-red-100 mb-8 animate-[spin_10s_linear_infinite]">
          <svg className="w-32 h-32 lg:w-40 lg:h-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            {/* Grieta del vinilo roto */}
            <path d="M12 2v6" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
            <path d="M17 7l-4 4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* Copywriting UX orientado a CX */}
        <h1 className="font-serif font-bold text-4xl lg:text-5xl text-brand-white-100 tracking-tight mb-4">
          ¡Help! I need somebody...
        </h1>
        
        <p className="font-sans text-brand-white-300 text-base lg:text-lg mb-10 max-w-lg">
          Parece que la página que buscás se quedó en Nowhere Land. No te preocupes, la banda sigue tocando y la cocina está abierta.
        </p>

        {/* Botones de rescate - CX Recovery */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link 
            href="/shows" 
            className="w-full sm:w-auto text-center bg-brand-red-100 text-brand-white-100 px-8 py-3.5 rounded-sm font-sans font-bold tracking-widest uppercase text-sm hover:bg-brand-red-200 transition-colors shadow-lg"
          >
            Agenda de Shows
          </Link>
          
          <Link 
            href="/menu" 
            className="w-full sm:w-auto text-center border-2 border-brand-white-300/30 text-brand-white-100 px-8 py-3.5 rounded-sm font-sans font-bold tracking-widest uppercase text-sm hover:border-brand-white-100 transition-colors"
          >
            Ver Menú
          </Link>
          
          <Link 
            href="/museo" 
            className="w-full sm:w-auto text-center border-2 border-brand-white-300/30 text-brand-white-100 px-8 py-3.5 rounded-sm font-sans font-bold tracking-widest uppercase text-sm hover:border-brand-white-100 transition-colors"
          >
            Visitas Guiadas
          </Link>
        </div>

      </div>
    </main>
  );
}