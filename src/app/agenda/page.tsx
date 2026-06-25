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

  // Cálculo para el botón del próximo mes
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthName = nextMonth.toLocaleString('es-ES', { month: 'long' });

  // SISTEMA DE ESTILOS ESTRICTOS (Basado en tu diseño original)
  const inactiveClass = "font-sans font-bold tracking-[0.2em] uppercase text-[10px] border-b-2 border-transparent pb-1 text-brand-white-300 hover:text-[#E6C987] hover:border-[#C5A059] transition-colors whitespace-nowrap";
  const activeClass = "font-sans font-bold tracking-[0.2em] uppercase text-[10px] bg-[#C5A059] text-brand-black-200 px-4 py-2 hover:bg-[#E6C987] transition-colors whitespace-nowrap";

  return (
    <main className="min-h-screen bg-brand-black-200 text-brand-white-100 font-sans pb-32">
      {/* Sección Hero (Mantenemos tu código intacto) */}
      <section className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image src="/placeholders/show.JPG" alt="Beatmemo Shows" fill className="object-cover opacity-60" priority sizes="100vw"/>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-brand-black-200/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-16 max-w-7xl mx-auto flex flex-col justify-end">
          <span className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-bold mb-4">Música en vivo</span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight text-brand-white-100">La Cartelera.</h1>
        </div>
      </section>

      {/* Navegación (Layout Original + Active State) */}
      <section className="max-w-7xl mx-auto px-4 py-8 flex justify-start sm:justify-between items-center border-b border-[#8B6D3B]/20 mb-12 overflow-x-auto gap-6 sm:gap-4 no-scrollbar">
        <Link 
          href="/agenda?view=past" 
          className={view === 'past' ? activeClass : inactiveClass}
        >
          Shows Anteriores
        </Link>
        <Link 
          href="/agenda?view=current" 
          className={view === 'current' ? activeClass : inactiveClass}
        >
          Este Mes
        </Link>
        <Link 
          href={`/agenda?view=next&mes=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`} 
          className={view === 'next' ? activeClass : inactiveClass}
        >
          Próximo Mes
        </Link>
      </section>

      {/* Zona Protegida */}
      <section className="max-w-7xl mx-auto px-4">
        <Suspense fallback={<BrandSpinner />}>
          <FullAgendaWrapper view={view} year={params.year} mes={params.mes} />
        </Suspense>
      </section>
    </main>
  );
}