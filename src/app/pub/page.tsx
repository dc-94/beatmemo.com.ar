// src/app/pub/page.tsx
import Image from "next/image";
import { Metadata } from 'next';
import { createClient } from "@/lib/supabase/server";
import { getOptimizedImageUrl } from "@/lib/utils";
import AtributoBadges from "@/components/pub/AtributoBadges";

export const metadata: Metadata = {
  title: 'Pub y Gastronomía',
  description: 'Nuestra carta de autor, cócteles clásicos y una propuesta gastronómica pensada para disfrutar mientras suena la mejor música.',
  openGraph: {
    title: 'Pub y Gastronomía | Beatmemo',
    description: 'Gastronomía de autor y los mejores cócteles en un ambiente temático único.',
    images: ['/og/pub.jpg'],
  },
};

export const revalidate = 300;

interface PubItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  url_imagen: string;
  categoria: string;
  tags: string[]; // Agregado según esquema DB
  es_vegetariano: boolean;
  es_vegano: boolean;
  es_sin_tacc: boolean;
  es_nuevo: boolean;
  es_recomendado: boolean;
}

export default async function PubPage() {
  const supabase = await createClient();

  // 1. DTO Sincronizado con DDL: Se pide tags, y se maneja is_deleted correctamente
  const { data, error } = await supabase
    .from("pub")
    .select("id, nombre, descripcion, url_imagen, categoria, tags, es_vegetariano, es_vegano, es_sin_tacc, es_nuevo, es_recomendado")
    .neq("is_deleted", true)
    .eq("disponible", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error crítico de DB en PubPage:", error);
  }

  const items = (data as PubItem[]) ?? [];

  // 2. Filtros Normalizados y Defensivos
  const food = items.filter((i) => {
    const cat = i.categoria?.trim().toLowerCase() || "";
    // Agrupamos 'promo' y 'food' en la misma sección para no romper el diseño a rajatabla
    return cat === "food" || cat === "comida" || cat === "promo";
  });

  const cocktails = items.filter((i) => {
    const cat = i.categoria?.trim().toLowerCase() || "";
    return cat === "cocktail" || cat === "tragos" || cat === "bebida";
  });

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C2924] scroll-smooth">
      
      {/* 1. HERO */}
      <section id="espacio" className="relative h-[70vh] w-full scroll-mt-20">
        <Image src="/placeholders/pub/burguer.jpg" alt="Pasta Beatmemo" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-black/40" /> 
        <div className="absolute bottom-16 left-4 lg:left-16 text-white">
          <span className="text-[#E6C987] uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Gastronomía & Barra</span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold mb-6">Classic Pub.</h1>
          <a href="#" className="bg-[#C5A059] text-black px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#E6C987] transition-colors inline-block">
            Ver Menú Completo
          </a>
        </div>
      </section>

      {/* 2. STICKY SUB-NAVBAR */}
      <nav className="sticky top-[80px] z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#D1CCC0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-center gap-3 sm:gap-10 py-4 w-full">
            <li>
              <a href="#espacio" className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#5C5852] hover:text-[#C5A059] transition-colors">Nuestro Espacio</a>
            </li>
            <li className="text-[#C5A059] font-bold text-xl leading-none mt-[-2px]">·</li>
            <li>
              <a href="#cocina" className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#5C5852] hover:text-[#C5A059] transition-colors">
                <span className="hidden sm:inline">Nuestra </span>Cocina
              </a>
            </li>
            <li className="text-[#C5A059] font-bold text-xl leading-none mt-[-2px]">·</li>
            <li>
              <a href="#barra" className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#5C5852] hover:text-[#C5A059] transition-colors">
                <span className="hidden sm:inline">Nuestra </span>Barra
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* INTRO Y FILTROS */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <h2 className="font-serif text-3xl mb-6">Sabores que cuentan historias</h2>
        <p className="text-[#5C5852] leading-relaxed">
          Nuestra cocina combina la tradición de los bodegones con ingredientes seleccionados. Cada plato y cada trago ha sido curado para ser disfrutado en un entorno que respira historia musical.
        </p>
      </section>

      {/* 3. SECCIÓN: COCINA */}
      <section id="cocina" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-32">
        <div className="flex flex-col items-center mb-12">
           <span className="text-[#A68966] uppercase tracking-[0.3em] text-[10px] font-bold mb-2">Food Menu</span>
           <h2 className="font-serif text-4xl font-bold">Nuestra Cocina</h2>
        </div>
        
        {food.length === 0 ? (
          <p className="text-center text-[#5C5852]">Estamos actualizando nuestra carta. Volvé pronto.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {food.map((item) => (
            <article key={item.id} className="group flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2 aspect-[4/3] relative overflow-hidden bg-white shadow-sm border border-[#D1CCC0]">
                {/* Fallback visual temporal si url_imagen es null o vacía */}
                <Image src={item.url_imagen ? getOptimizedImageUrl(item.url_imagen, 600, 450) : '/placeholders/pub/burguer.jpg'} alt={item.nombre} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                <span className="text-[#A68966] text-[9px] uppercase font-bold tracking-widest">{item.categoria}</span>
                <h3 className="font-serif text-xl font-bold">{item.nombre}</h3>
                {item.descripcion && <p className="text-[#5C5852] text-sm leading-relaxed">{item.descripcion}</p>}
                {/* El componente hijo ahora recibirá el objeto con la prop 'tags' */}
                <AtributoBadges item={item} />
              </div>
            </article>
          ))}
        </div>
        )}
      </section>

      {/* SECCIÓN VALORES EDITORIAL */}
      <section className="py-20 bg-[#F2EDE5] border-y border-[#D1CCC0]/50">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-16 text-center">
          <div className="space-y-4">
            <h4 className="font-serif text-xl font-bold text-[#A68966]">Cocina Sin TACC</h4>
            <p className="text-sm text-[#5C5852]">Contamos con estrictos protocolos de manipulación para ofrecer opciones seguras sin perder el sabor artesanal que nos caracteriza.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-serif text-xl font-bold text-[#A68966]">Meat Free Monday</h4>
            <p className="text-sm text-[#5C5852]">Inspirados en la conciencia global, cada lunes nuestra carta destaca opciones basadas en plantas, celebrando los productos de estación.</p>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN: BARRA */}
      <section id="barra" className="max-w-7xl mx-auto px-4 py-24 scroll-mt-32">
        <div className="flex flex-col items-center mb-12">
           <span className="text-[#A68966] uppercase tracking-[0.3em] text-[10px] font-bold mb-2">Drinks & Co.</span>
           <h2 className="font-serif text-4xl font-bold">Nuestra Barra</h2>
        </div>

        {cocktails.length === 0 ? (
          <p className="text-center text-[#5C5852]">Estamos preparando nuevos tragos. Volvé pronto.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {cocktails.map((item) => (
            <article key={item.id} className="group flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2 aspect-[4/3] relative overflow-hidden bg-white shadow-sm border border-[#D1CCC0]">
                <Image src={item.url_imagen ? getOptimizedImageUrl(item.url_imagen, 600, 450) : '/placeholders/pub/cocktail01.jpg'} alt={item.nombre} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                <span className="text-[#A68966] text-[9px] uppercase font-bold tracking-widest">{item.categoria}</span>
                <h3 className="font-serif text-xl font-bold">{item.nombre}</h3>
                {item.descripcion && <p className="text-[#5C5852] text-sm leading-relaxed">{item.descripcion}</p>}
                <AtributoBadges item={item} />
              </div>
            </article>
          ))}
        </div>
        )}
      </section>

      {/* FOOTER CTA */}
      <section className="py-16 text-center">
        <a href="#" className="border border-[#A68966] text-[#A68966] px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-[#A68966] hover:text-white transition-all inline-block">
          Descargar Carta Completa
        </a>
      </section>
    </main>
  );
}