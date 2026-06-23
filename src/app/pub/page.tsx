// src/app/pub/page.tsx
import Image from "next/image";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pub y Gastronomía',
  description: 'Nuestra carta de autor, cócteles clásicos y una propuesta gastronómica pensada para disfrutar mientras suena la mejor música.',
  openGraph: {
    title: 'Pub y Gastronomía | Beatmemo',
    description: 'Gastronomía de autor y los mejores cócteles en un ambiente temático único.',
    images: ['/og/pub.jpg'],
  },
};

const cocktails = [
  {
    title: "Beatmemo Spritz",
    desc: "Un clásico italiano reinterpretado con notas cítricas intensas y un toque espumante. El aperitivo perfecto para abrir el apetito.",
    img: "/placeholders/pub/cocktail01.jpg",
    category: "Cocktails"
  },
  {
    title: "Citrus Mint Sour",
    desc: "Frescura absoluta. Una base cítrica balanceada con espuma sedosa y un bouquet aromático de menta fresca recién cortada.",
    img: "/placeholders/pub/cocktail03.jpeg",
    category: "Cocktails"
  },
];

const food = [
  {
    title: "Pesto Vitality Pasta",
    desc: "Pasta artesanal al dente bañada en una emulsión vibrante de albahaca fresca, nueces tostadas y aceite de oliva virgen extra.",
    img: "/placeholders/pub/food03.png",
    category: "Main Courses"
  },
  {
    title: "Beat Burguer",
    desc: "Blend de carnes seleccionadas, queso cheddar fundido y nuestro pan brioche artesanal sellado con manteca.",
    img: "/placeholders/pub/burguer.jpg",
    category: "Main Courses"
  }
];

export default function PubPage() {
  return (
    // IMPORTANTE: scroll-smooth añadido para que la navegación por anclas sea suave
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

      {/* 2. STICKY SUB-NAVBAR (Scrollspy Menu) - Híbrido Mobile/Desktop con Separadores */}
      <nav className="sticky top-[80px] z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#D1CCC0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Cambiamos a justify-center y gap-3 (móvil) / gap-10 (desktop) para controlar los puntos */}
          <ul className="flex items-center justify-center gap-3 sm:gap-10 py-4 w-full">
            <li>
              <a href="#espacio" className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#5C5852] hover:text-[#C5A059] transition-colors">Nuestro Espacio
              </a>
            </li>
            
            <li className="text-[#C5A059] font-bold text-xl leading-none mt-[-2px]">
              ·
            </li>

            <li>
              <a href="#cocina" className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#5C5852] hover:text-[#C5A059] transition-colors">
                <span className="hidden sm:inline">Nuestra </span>Cocina
              </a>
            </li>

            {/* Punto Dorado */}
            <li className="text-[#C5A059] font-bold text-xl leading-none mt-[-2px]">
              ·
            </li>

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {food.map((item, idx) => (
            <article key={idx} className="group flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2 aspect-[4/3] relative overflow-hidden bg-white shadow-sm border border-[#D1CCC0]">
                <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                <span className="text-[#A68966] text-[9px] uppercase font-bold tracking-widest">{item.category}</span>
                <h3 className="font-serif text-xl font-bold">{item.title}</h3>
                <p className="text-[#5C5852] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECCIÓN VALORES (Parte de la cocina) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {cocktails.map((item, idx) => (
            <article key={idx} className="group flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2 aspect-[4/3] relative overflow-hidden bg-white shadow-sm border border-[#D1CCC0]">
                <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                <span className="text-[#A68966] text-[9px] uppercase font-bold tracking-widest">{item.category}</span>
                <h3 className="font-serif text-xl font-bold">{item.title}</h3>
                <p className="text-[#5C5852] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
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