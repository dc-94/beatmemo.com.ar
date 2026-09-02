// src/app/agenda/page.tsx
import { Suspense } from "react";
import Image from "next/image";
import  { Metadata } from "next";
import FullAgendaWrapper from "@/components/agenda/FullAgendaWrapper";
import AgendaScrollHint from "@/components/agenda/AgendaScrollHint";
import BrandSpinner from "@/components/ui/BrandSpinner";
import { getSiteContent } from "@/lib/site-content";
import { getShowsByView } from "@/lib/shows-data";
import { getOptimizedImageUrl } from "@/lib/utils";
import AgendaTabs from "@/components/agenda/AgendaTabs";

export const metadata: Metadata = {
  title: "Agenda de Shows",
  description: "Cartelera de shows en vivo, música y eventos culturales en Beatmemo Rosario. Consultá la programación del mes.",
  openGraph: {
    title: "Agenda de Shows | Beatmemo",
    description: "Shows en vivo y eventos culturales en el pub temático de Rosario.",
    images: ["/og/agenda.jpg"],
  },
};

export const revalidate = 600;

export default async function AgendaPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ view?: string, mes?: string, year?: string }> 
}) {
  const params = await searchParams;
  const view = params.view || 'current';
  const contenido = await getSiteContent("agenda");
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthName = nextMonth.toLocaleString('es-ES', { month: 'long' });

const nextResult = await getShowsByView("next", String(nextMonth.getFullYear()), String(nextMonth.getMonth() + 1));
const hayProximos = nextResult.ok && nextResult.data.length > 0;


  return (
    <main className="min-h-screen bg-brand-black-200 text-brand-white-100 font-sans pb-32">
      {/* Sección Hero */}
      <section className="relative h-[38vh] lg:h-[45vh] w-full">
        {contenido?.imagen_url ? (
          <Image
            src={getOptimizedImageUrl(contenido.imagen_url, 1920, 900)}
            alt={contenido.alt_texto || "Shows en vivo en Beatmemo"}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-black-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-brand-black-200/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-16 max-w-7xl mx-auto flex flex-col justify-end">
          <span className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-bold mb-4">
            {contenido?.subtitulo || "Música en vivo"}
          </span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight text-brand-white-100">
            {contenido?.titulo || "La Cartelera."}
          </h1>
        </div>
      </section>
{/* Tabs sin estilo de botón */}
      <AgendaTabs view={view} nextMonth={nextMonth} hayProximos={hayProximos} />

      {/* Contenido */}
      <section className="max-w-7xl mx-auto px-4 min-h-[40vh]">
        <Suspense fallback={<BrandSpinner />}>
          <FullAgendaWrapper view={view} year={params.year} mes={params.mes} />
        </Suspense>
      </section>

      {/* Desplazamiento sutil al entrar, para asomar la primera fila */}
      <AgendaScrollHint />
    </main>
  );
}