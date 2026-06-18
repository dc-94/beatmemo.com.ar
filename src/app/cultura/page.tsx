// src/app/cultura/page.tsx
import Image from "next/image";
import { getCulturalEvents } from "@/actions/shows";
import { Show } from "@/types/database.types"; // Ajusta el import si tu tipo se llama diferente

// Helper puro para resolver el gradiente de la bandera según el ciclo
function getBorderTheme(ciclo: string) {
  const normalized = ciclo.toLowerCase();
  if (normalized.includes("italiano")) {
    return "bg-gradient-to-r from-green-600 via-white to-red-600";
  }
  if (normalized.includes("inglés") || normalized.includes("ingles")) {
    return "bg-gradient-to-r from-[#012169] via-white to-[#C8102E]"; // UK colors
  }
  return "bg-[#C5A059]"; // Default dorado para Vinilo u otros
}

export default async function CulturaPage() {
  // Obtenemos los eventos directamente en el servidor (React Server Component)
  const eventos = await getCulturalEvents();

  return (
    <main className="min-h-screen bg-[#F5F4F0] text-brand-black-100 font-sans pb-32">
      
      {/* 1. HERO SANGRE COMPLETO CON GRADIENTE INFERIOR */}
     <section className="relative h-[50vh] lg:h-[60vh] w-full">
        <Image 
          src="/placeholders/fachada.JPG" 
          alt="Fachada Cultural Beatmemo" 
          fill 
          className="object-cover" 
          priority 
          sizes="100vw"
        />
        {/* Gradiente: Empieza en negro oscuro arriba, y se funde hacia el color hueso (#F5F4F0) en la base */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black-100/90 via-brand-black-100/60 to-[#F5F4F0]" />
        
        {/* Centramos el texto en el eje vertical para que quede sobre la zona oscura y contraste perfecto */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 max-w-7xl mx-auto">
          <span className="text-[#f1f1f1] uppercase tracking-[0.4em] text-[14px] font-bold mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            Comunidad y Encuentro
          </span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight text-[#fafafa] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            Cultura Viva.
          </h1>
        </div>
      </section>

      {/* 2. INTRODUCCIÓN EDITORIAL */}
      <section className="py-16 px-4 max-w-3xl mx-auto text-center lg:text-left">
        <p className="text-lg lg:text-xl text-gray-700 leading-relaxed font-light">
          Más allá de la música, Beatmemo es un núcleo de intercambio cultural en Rosario. 
          Declarado sitio de interés por la Municipalidad, abrimos nuestras puertas semanalmente 
          para fusionar gastronomía, idiomas y el amor por el formato físico. Sumate a nuestras mesas.
        </p>
      </section>

      {/* 3. GRILLA DE EVENTOS CULTURALES CON "AIRE" (GAP) */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-[#C5A059] uppercase tracking-[0.3em] text-[14px] font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6C987] animate-pulse" />
            Agenda Abierta
          </span>
          <h2 className="font-serif font-bold text-4xl lg:text-5xl text-brand-black-100 tracking-tight">
            Próximos eventos culturales
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
        {eventos.map((evento: Show) => {
            const fechaStr = new Date(evento.fecha_hora).toLocaleDateString("es-AR", { 
              weekday: 'long', day: "numeric", month: "long" 
            });
            const horaStr = new Date(evento.fecha_hora).toLocaleTimeString("es-AR", { 
              hour: '2-digit', minute: '2-digit' 
            });

            return (
              <article 
                key={evento.id} 
                // flex-row en móvil (horizontal) y flex-col en PC (vertical)
                className="relative flex flex-row md:flex-col bg-brand-white-100 border border-brand-black-100/10 rounded-sm shadow-md md:shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                {/* Micro-interacción: Borde/Bandera superior absoluta para que funcione en ambos layouts */}
                <div className={`absolute top-0 left-0 w-full h-1 md:h-2 z-10 ${getBorderTheme(evento.ciclo)}`} />
                
                {/* IMAGEN: 35% ancho en móvil, 100% ancho en PC */}
                <div className="relative w-[35%] md:w-full shrink-0 md:aspect-video overflow-hidden bg-brand-black-200">
                  <Image 
                    src={evento.url_imagen} 
                    alt={evento.ciclo} 
                    fill 
                    className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                    sizes="(max-width: 768px) 35vw, 33vw"
                  />
                </div>

                {/* CUERPO DE LA TARJETA */}
                <div className="flex flex-col p-4 md:p-6 lg:p-8 w-[65%] md:w-full grow justify-between">
                  
                  <div className="mt-1 md:mt-0">
                    {/* Encabezado: Ciclo y Precio (apilados en móvil, separados en PC) */}
                    <div className="flex flex-col md:flex-row justify-start md:justify-between items-start mb-2 md:mb-4 gap-2 md:gap-0">
                      <span className="text-[#C5A059] text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-b border-[#C5A059] pb-0.5 w-fit">
                        {evento.ciclo}
                      </span>
                      <span className="bg-brand-black-100 text-brand-white-100 px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] uppercase font-bold tracking-widest rounded-none w-fit">
                        {evento.precio === 0 ? "FREE" : `$${evento.precio}`}
                      </span>
                    </div>
                    
                    {/* Título de la Mesa/Banda */}
                    <h3 className="font-serif font-bold text-lg md:text-2xl text-brand-black-100 mb-1 md:mb-2 leading-tight line-clamp-2">
                      {evento.banda}
                    </h3>
                    
                    {/* Fecha y Hora */}
                    <div className="flex flex-col text-xs md:text-sm text-gray-500 font-sans mb-3 md:mb-6">
                      <span className="capitalize">{fechaStr}</span>
                      <span>{horaStr} hs</span>
                    </div>

                    {/* Descripción: SE OCULTA EN MÓVIL para salvar espacio */}
                    <p className="hidden md:block text-sm text-gray-600 line-clamp-3 mb-8 grow">
                      {evento.descripcion}
                    </p>
                  </div>

                  {/* Botón CTA */}
                  <a 
                    href={`https://wa.me/5493412023737?text=Hola,%20quiero%20anotarme%20para%20${encodeURIComponent(evento.ciclo)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-fit md:w-full text-left md:text-center border-t-0 md:border-t border-brand-black-100/10 pt-1 md:pt-4 font-sans font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-[9px] md:text-[11px] text-brand-black-100 hover:text-[#C5A059] transition-colors mt-auto border-b md:border-b-0 border-brand-black-100 pb-0.5 md:pb-0"
                  >
                    Confirmar <span className="hidden md:inline">Asistencia</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
          {/* SECCIÓN INSTITUCIONAL: DECLARACIÓN DE LA MUNICIPALIDAD */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-0 bg-white border border-brand-black-100/5 shadow-lg overflow-hidden">
          
          {/* Columna de Texto Editorial */}
          <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest border-b border-[#C5A059] pb-1 w-fit mb-6">
              Reconocimiento Oficial
            </span>
            <h2 className="font-serif font-bold text-3xl lg:text-4xl text-brand-black-100 leading-tight mb-6">
              Museo Tributo Distinguido de Rosario
            </h2>
            <p className="text-gray-600 leading-relaxed font-light mb-4">
              A través del <strong>Decreto Nº 51027/2017</strong>, el Honorable Concejo Municipal de la ciudad declaró a Beatmemo como patrimonio cultural, reconociéndonos como el primer y único espacio temático de Sudamérica dedicado a preservar el legado de The Beatles con una línea de tiempo inmersiva.
            </p>
            <p className="text-gray-600 leading-relaxed font-light">
              Este galardón reafirma nuestro compromiso no solo con la gastronomía, sino con la educación, el arte y la historia musical internacional.
            </p>
          </div>

          {/* Columna de Imagen (Fachada reutilizada) */}
          <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-[4/3] overflow-hidden bg-brand-black-200">
            <Image 
              src="/placeholders/fachada.JPG" 
              alt="Fachada Museo Tributo Distinguido" 
              fill 
              className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

        </div>
      </section>
    </main>
  );
}