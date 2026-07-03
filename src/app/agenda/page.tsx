// src/app/agenda/page.tsx
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import FullAgendaWrapper from "@/components/agenda/FullAgendaWrapper";
import BrandSpinner from "@/components/ui/BrandSpinner";

export default async function AgendaPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ view?: string, mes?: string, year?: string }> 
}) {
  const params = await searchParams;
  const view = params.view || 'current';

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthName = nextMonth.toLocaleString('es-ES', { month: 'long' });
  const currentMonthName = now.toLocaleString('es-ES', { month: 'long' });

  // NUEVO SISTEMA DE TABS (Pills) PARA MÁXIMA UX MÓVIL
  const inactiveClass = "px-6 py-2.5 rounded-full border border-[#8B6D3B]/40 text-brand-white-300 font-sans font-bold tracking-[0.15em] text-[11px] uppercase whitespace-nowrap hover:border-[#C5A059] transition-all bg-black/40 backdrop-blur-sm";
  const activeClass = "px-6 py-2.5 rounded-full bg-[#C5A059] text-brand-black-200 font-sans font-bold tracking-[0.15em] text-[11px] uppercase whitespace-nowrap shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all";

  return (
    <main className="min-h-screen bg-brand-black-200 text-brand-white-100 font-sans pb-32">
      {/* Sección Hero */}
      <section className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image src="/placeholders/show.JPG" alt="Beatmemo Shows" fill className="object-cover opacity-60" priority sizes="100vw"/>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-brand-black-200/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-16 max-w-7xl mx-auto flex flex-col justify-end">
          <span className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-bold mb-4">Música en vivo</span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight text-brand-white-100">La Cartelera.</h1>
        </div>
      </section>

      {/* Navegación UX Mobile Premium (Scroll horizontal suave) */}
      <section className="relative max-w-7xl mx-auto mb-12">
        {/* Sombras laterales para indicar que hay scroll en móvil */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-brand-black-200 to-transparent z-10 md:hidden pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-black-200 to-transparent z-10 md:hidden pointer-events-none" />
        
        <div className="px-4 py-8 flex items-center overflow-x-auto gap-4 no-scrollbar relative z-0 snap-x snap-mandatory">
          <Link 
            href="/agenda?view=past" 
            className={`${view === 'past' ? activeClass : inactiveClass} snap-start shrink-0`}
          >
            Anteriores
          </Link>
          <Link 
            href="/agenda?view=current" 
            className={`${view === 'current' ? activeClass : inactiveClass} snap-start shrink-0`}
          >
            {currentMonthName}
          </Link>
          <Link 
            href={`/agenda?view=next&mes=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`} 
            className={`${view === 'next' ? activeClass : inactiveClass} snap-start shrink-0`}
          >
            {nextMonthName}
          </Link>
        </div>
      </section>

      {/* Zona Protegida de Contenido */}
      <section className="max-w-7xl mx-auto px-4 min-h-[40vh]">
        <Suspense fallback={<BrandSpinner />}>
          <FullAgendaWrapper view={view} year={params.year} mes={params.mes} />
        </Suspense>
      </section>
    </main>
  );
}