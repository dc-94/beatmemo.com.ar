// src/app/shows/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getShowsList } from "@/actions/shows";
import ShowCard from "@/components/shows/ShowCard";

export default async function ShowsPage({
  searchParams,
}: {
  searchParams: { mes?: string; año?: string };
}) {
  const shows = await getShowsList(searchParams.año, searchParams.mes);

  return (
    <main className="min-h-screen bg-brand-black-200 text-brand-white-100 font-sans pb-32">
      {/* HERO CON BRANDING OSCURO */}
      <section className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image 
          src="/placeholders/show.JPG" 
          alt="Beatmemo Shows en Vivo" 
          fill 
          className="object-cover opacity-60" 
          priority 
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-brand-black-200/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-16 max-w-7xl mx-auto flex flex-col justify-end">
          <span className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-bold mb-4">
            Música en vivo
          </span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight text-brand-white-100">
            La Cartelera.
          </h1>
        </div>
      </section>

      {/* CONTROLES ESTILO EDITORIAL */}
      <section className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center border-b border-[#8B6D3B]/20 mb-12">
        <Link 
          href="?mes=05&año=2026" 
          className="font-sans font-bold tracking-[0.2em] uppercase text-[10px] border-b-2 border-[#C5A059] pb-1 text-brand-white-300 hover:text-[#E6C987] transition-colors"
        >
          Shows Anteriores
        </Link>
        <Link 
          href="/shows" 
          className="font-sans font-bold tracking-[0.2em] uppercase text-[10px] bg-[#C5A059] text-brand-black-200 px-4 py-2 hover:bg-[#E6C987] transition-colors"
        >
          Próximos Shows
        </Link>
      </section>

      {/* GRILLA DE CARTELERA */}
      <section className="max-w-7xl mx-auto px-4">
        {shows.length === 0 ? (
          <p className="text-center text-brand-white-300 py-12">No hay shows programados para este período.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shows.map((show: any) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}