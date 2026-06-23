// src/app/shows/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getShowsList } from "@/actions/shows";
import ShowCard from "@/components/shows/ShowCard";
import { Show } from "@/types/database.types"; // Tipado estricto

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cartelera de Shows',
  description: 'Descubrí la agenda de música en vivo, bandas y eventos culturales de esta semana en Beatmemo Rosario.',
  openGraph: {
    title: 'Cartelera de Shows | Beatmemo',
    description: 'Música en vivo, bandas y eventos culturales en el corazón de Rosario.',
    images: ['/og/shows.jpg'],
  },
};

export default async function ShowsPage({
  searchParams,
}: {
  // Obligatorio en Next.js 15+: searchParams es una Promesa
  searchParams: Promise<{ mes?: string; year?: string }>;
}) {
  const resolvedParams = await searchParams; // Resolvemos la promesa
  const shows = await getShowsList(resolvedParams.year, resolvedParams.mes);

  return (
    <main className="min-h-screen bg-brand-black-200 text-brand-white-100 font-sans pb-32">
      <section className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image src="/placeholders/show.JPG" alt="Beatmemo Shows en Vivo" fill className="object-cover opacity-60" priority sizes="100vw"/>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-brand-black-200/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-16 max-w-7xl mx-auto flex flex-col justify-end">
          <span className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-bold mb-4">Música en vivo</span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight text-brand-white-100">La Cartelera.</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center border-b border-[#8B6D3B]/20 mb-12">
        {/* Cambiado "año" por "year" para evitar errores de codificación HTTP */}
        <Link 
          href="?mes=05&year=2026" 
          className="font-sans font-bold tracking-[0.2em] uppercase text-[10px] border-b-2 border-[#C5A059] pb-1 text-brand-white-300 hover:text-[#E6C987] transition-colors"
        >
          Shows Anteriores
        </Link>
        <Link href="/agenda" className="font-sans font-bold tracking-[0.2em] uppercase text-[10px] bg-[#C5A059] text-brand-black-200 px-4 py-2 hover:bg-[#E6C987] transition-colors">
          Próximos Shows
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        {shows.length === 0 ? (
          <p className="text-center text-brand-white-300 py-12">No hay shows programados para este período.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Eliminado el 'any'. Usamos tipado robusto. */}
            {shows.map((show: Show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}