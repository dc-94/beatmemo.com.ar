
import Image from "next/image";
import Link from "next/link";
import MuseoTimeline from "@/components/museo/MuseoTimeline";

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Museo Beatle',
  description: 'Explora nuestra colección privada y única con objetos históricos sobre la carrera de The Beatles. Una experiencia cultural imperdible en Rosario.',
  openGraph: {
    title: 'Museo Beatle | Beatmemo',
    description: 'Explora nuestra colección privada y única sobre la historia de los Fab Four.',
    images: ['/og/museo.jpg'],
  },
};

export default function MuseoPage() {
  const timelineEvents = [
    {
      year: "1940s",
      title: "Los Orígenes",
      desc: "Liverpool bajo las sombras de la posguerra. Las infancias de John, Paul, George y Ringo se forjaron en calles obreras, donde el rock and roll americano llegó por el puerto para cambiar sus destinos para siempre.",
    },
    {
      year: "1957",
      title: "La Formación",
      desc: "El Big Bang ocurrió el 6 de julio en la fiesta de Woolton Parish Church. John Lennon conoció a Paul McCartney. Nacen The Quarrymen y se siembra el germen de la dupla de compositores más grande del siglo.",
    },
    {
      year: "1963",
      title: "La Beatlemanía",
      desc: "Estalla el fenómeno. Giras extenuantes, trajes a medida, gritos ensordecedores y discos que rompieron todos los récords. El mundo entero sucumbe ante el encanto de los cuatro de Liverpool.",
    },
    {
      year: "1966",
      title: "La Era del Estudio",
      desc: "Agotados de los gritos que no los dejaban escucharse, abandonan los escenarios para revolucionar la grabación. Llega 'Sgt. Pepper''s', la psicodelia y la cúspide creativa de la banda.",
    },
    {
      year: "1970",
      title: "Los Caminos Solistas",
      desc: "El sueño terminó, pero la música no. La separación marcó el inicio de cuatro legados individuales inmortales que continuaron dando forma a la cultura pop mundial.",
    }
  ];

  return (
    <main className="min-h-screen bg-brand-black-200 text-brand-white-100 overflow-hidden font-sans">
      
      {/* 1. HERO SANGRE COMPLETO */}
      <section className="relative h-[60vh] lg:h-[70vh] w-full">
        <Image 
          src="/placeholders/museo.jpg" 
          alt="Beatmemo Museo" 
          fill 
          className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000" 
          priority 
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-brand-black-200/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-16 max-w-7xl mx-auto flex flex-col justify-end">
          <span className="text-[#f9e12e] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] uppercase tracking-[0.4em] text-[14px] font-bold mb-4 ">
            Espacio Cultural Temático
          </span>
          <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight drop-shadow-lg text-brand-white-100">
            Más que un bar,<br/>
            <span className="text-[#E6C987]">una cápsula del tiempo.</span>
          </h1>
        </div>
      </section>

      {/* 2. INTRODUCCIÓN EDITORIAL CON DROP CAP */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <p className="text-base lg:text-xl text-brand-white-300 leading-relaxed font-light">
          <span className="first-letter:float-left first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-serif first-letter:text-[#C5A059] first-letter:pr-3 first-letter:pt-2 first-letter:leading-none">
            B
          </span>
          eatmemo es el primer espacio cultural de Sudamérica dedicado exclusivamente a preservar y celebrar el legado de The Beatles. En nuestras paredes descansan objetos inéditos, fotografías históricas y una línea de tiempo meticulosamente curada que invita a fanáticos y curiosos a sumergirse en la historia de la banda que cambió el mundo para siempre.
        </p>
      </section>

      {/* 3. BANNER SUTIL SUPERIOR */}
      <section className="border-y border-[#8B6D3B]/20 bg-brand-black-100/50 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-[10px] tracking-[0.2em] uppercase font-bold text-brand-white-300">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"/> Visitas libres diarias</span>
          <span className="hidden sm:block text-[#8B6D3B]">|</span>
          <span className="text-[#E6C987]">Guía gratuita: Dom 11hs</span>
          <span className="hidden sm:block text-[#8B6D3B]">|</span>
          <a href="#visitas" className="border-b border-[#C5A059]/50 pb-0.5 hover:text-[#E6C987] transition-colors">Opciones privadas y escuelas</a>
        </div>
      </section>

     <section className="py-24 px-4 max-w-6xl mx-auto relative">
        <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-black-200 via-[#C5A059]/40 to-brand-black-200 transform lg:-translate-x-1/2" />
        
        {/* Aquí pasamos los datos al componente animado */}
        <MuseoTimeline events={timelineEvents} />
      </section>

      {/* 5. AUDIOGUÍAS */}
      <section className="w-full bg-[#111111] border-y border-[#8B6D3B]/20 py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h3 className="font-serif text-3xl text-[#E6C987]">Tu recorrido, a tu ritmo.</h3>
            <p className="text-brand-white-300">Escaneá el código QR en la entrada del museo y accedé a nuestra audioguía inmersiva.</p>
          </div>
        </div>
      </section>

      {/* 6. BANNER INFERIOR GRANDE (Opciones de Visita) */}
      <section id="visitas" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="w-full bg-brand-black-100 border border-[#8B6D3B]/20 p-8 lg:p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">
          {/* Brillo dorado sutil en el fondo del banner */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-2 text-center lg:text-left border-b border-[#8B6D3B]/20 pb-8 relative z-10">
            <h3 className="font-serif font-bold text-3xl text-brand-white-100 uppercase tracking-wide">
              Planificá tu visita
            </h3>
            <p className="font-sans text-[#C5A059] text-sm tracking-widest uppercase">
              Abierto todos los días para visitas libres
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {/* Col 1 */}
            <div className="flex flex-col gap-2 border-l-0 md:border-l border-[#8B6D3B]/20 md:pl-8 first:border-0 first:pl-0">
              <span className="text-[#C5A059] font-bold uppercase tracking-widest text-[10px]">Guía Gratuita</span>
              <span className="font-sans text-[#E6C987] font-bold text-sm">Domingos 11:00 hs</span>
              <span className="text-brand-white-300 text-[11px]">Sin reserva previa.</span>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-2 border-l-0 md:border-l border-[#8B6D3B]/20 md:pl-8">
              <span className="text-[#C5A059] font-bold uppercase tracking-widest text-[10px]">Guías Privadas</span>
              <a 
                href="https://wa.me/5493412023737?text=Hola,%20quisiera%20consultar%20por%20una%20visita%20guiada%20privada%20al%20museo." 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 group w-fit"
              >
                <svg className="w-4 h-4 text-brand-white-100 group-hover:text-green-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.553 4.195 1.604 6.015L.302 24l6.108-1.599A11.96 11.96 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm6.49 17.185c-.276.772-1.6 1.488-2.221 1.523-.591.033-1.353-.131-2.233-.398-.925-.28-2.296-.924-3.959-2.587-1.662-1.662-2.307-3.034-2.587-3.959-.266-.88-.431-1.642-.398-2.233.035-.621.751-1.945 1.523-2.221.246-.086.516-.104.764-.029.215.066.425.267.625.688.271.569.759 1.86.827 1.996.068.136.113.295.023.477-.091.182-.136.295-.273.454-.136.159-.286.341-.409.454-.136.136-.282.285-.125.556.159.273.705 1.163 1.514 1.884.922.822 1.803 1.096 2.075 1.232.273.136.432.114.591-.068.159-.182.682-.795.864-1.068.182-.273.364-.227.614-.136.25.091 1.59.75 1.863.886.273.136.454.204.522.318.068.114.068.659-.208 1.431z"/></svg>
                <span className="font-sans text-brand-white-100 font-bold text-sm border-b border-transparent group-hover:border-brand-white-100 transition-colors">Solicitá turno</span>
              </a>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col gap-2 border-l-0 md:border-l border-[#8B6D3B]/20 md:pl-8">
              <span className="text-[#C5A059] font-bold uppercase tracking-widest text-[10px]">Instituciones Educativas</span>
              <span className="text-brand-white-300 text-[11px]">Disponible en Inglés y Español.</span>
              <Link 
                href="/museo/visitas-guiadas" 
                className="font-sans text-[#E6C987] font-bold text-sm border-b border-[#E6C987] w-fit pb-0.5 hover:text-brand-white-100 hover:border-brand-white-100 transition-colors"
              >
                Reservar para escuelas
              </Link>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
}