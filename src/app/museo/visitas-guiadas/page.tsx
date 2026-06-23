"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function VisitasGuiadasPage() {
  return (
    <main className="min-h-screen bg-brand-black-200 text-brand-white-100 overflow-hidden font-sans pb-32">
      
      {/* HEADER MINIMALISTA */}
      <section className="pt-32 pb-16 px-4 text-center max-w-4xl mx-auto">
        <span className="text-[#C5A059] uppercase tracking-[0.4em] text-[10px] font-bold drop-shadow-md block mb-4">
          Descubrí el legado
        </span>
        <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-brand-white-100">
          Viví la experiencia <span className="text-[#E6C987] italic">desde adentro.</span>
        </h1>
      </section>

      {/* BLOQUE 1: VISITA DOMINICAL (Z-Pattern: Imagen Izquierda) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative aspect-[4/3] border border-[#8B6D3B]/20 rounded-none overflow-hidden"
          >
            <Image 
              src="/placeholders/museo.jpg" 
              alt="Visita guiada gratuita" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col gap-6"
          >
            <h2 className="font-serif text-3xl lg:text-4xl text-[#E6C987] font-bold">Free Tour</h2>
            <p className="text-brand-white-300 text-base leading-relaxed">
              Sumergite en la historia de los cuatro grandes. Todos los domingos abrimos nuestras puertas para un recorrido guiado grupal donde repasamos los hitos más importantes de nuestro museo. Una experiencia ideal para disfrutar en familia o con amigos.
            </p>
            <div className="mt-4 border-l-2 border-[#C5A059] pl-6 flex flex-col gap-1">
              <span className="font-sans font-bold text-lg text-brand-white-100">Domingos a las 11:00 hs</span>
              <span className="text-[#C5A059] text-xs font-bold uppercase tracking-widest">Entrada libre — Sin reserva previa</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE 2: VISITAS PRIVADAS (Z-Pattern: Imagen Derecha) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative aspect-[4/3] border border-[#8B6D3B]/20 rounded-none overflow-hidden"
          >
            <Image 
              src="/placeholders/museo.jpg" 
              alt="Visita guiada privada" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col gap-6 lg:text-right items-start lg:items-end"
          >
            <h2 className="font-serif text-3xl lg:text-4xl text-[#E6C987] font-bold">Tours Privados.</h2>
            <p className="text-brand-white-300 text-base leading-relaxed">
              Diseñamos recorridos exclusivos para grupos cerrados, contingentes turísticos y eventos corporativos. Una atención personalizada que puede combinarse con una experiencia de cata y degustación en nuestro  Pub.
            </p>
            <a 
              href="https://wa.me/5493412023737?text=Hola,%20quisiera%20consultar%20disponibilidad%20y%20tarifas%20para%20una%20visita%20privada%20al%20museo." 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-3 group"
            >
              <span className="font-sans font-bold tracking-[0.2em] uppercase text-xs border-b-2 border-[#C5A059] pb-1 text-brand-white-100 group-hover:text-[#E6C987] transition-colors">
                Consultá disponibilidad
              </span>
              <svg className="w-5 h-5 text-[#C5A059] group-hover:text-green-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.553 4.195 1.604 6.015L.302 24l6.108-1.599A11.96 11.96 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm6.49 17.185c-.276.772-1.6 1.488-2.221 1.523-.591.033-1.353-.131-2.233-.398-.925-.28-2.296-.924-3.959-2.587-1.662-1.662-2.307-3.034-2.587-3.959-.266-.88-.431-1.642-.398-2.233.035-.621.751-1.945 1.523-2.221.246-.086.516-.104.764-.029.215.066.425.267.625.688.271.569.759 1.86.827 1.996.068.136.113.295.023.477-.091.182-.136.295-.273.454-.136.159-.286.341-.409.454-.136.136-.282.285-.125.556.159.273.705 1.163 1.514 1.884.922.822 1.803 1.096 2.075 1.232.273.136.432.114.591-.068.159-.182.682-.795.864-1.068.182-.273.364-.227.614-.136.25.091 1.59.75 1.863.886.273.136.454.204.522.318.068.114.068.659-.208 1.431z"/>
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE 3: ESCUELAS (Z-Pattern: Imagen Izquierda + Calendly Abajo) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative aspect-[4/3] border border-[#8B6D3B]/20 rounded-none overflow-hidden"
          >
            <Image 
              src="/placeholders/museo.jpg" 
              alt="Visitas institucionales" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col gap-6"
          >
            <h2 className="font-serif text-3xl lg:text-4xl text-[#E6C987] font-bold">Instituciones Educativas</h2>
            <p className="text-brand-white-300 text-base leading-relaxed">
              Acercamos la cultura musical a las nuevas generaciones mediante una propuesta pedagógica adaptada. Organizamos recorridos estructurados para colegios, facilitando un espacio de aprendizaje dinámico sobre el impacto sociocultural de la banda.
            </p>
            <span className="font-sans font-bold tracking-[0.2em] uppercase text-xs text-[#C5A059] mt-2">
              Reservá tu visita a continuación
            </span>
          </motion.div>
        </div>

        {/* CONTENEDOR CALENDLY ESTRUCTURADO */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="w-full max-w-5xl mx-auto h-[600px] bg-[#111111] border border-[#8B6D3B]/30 flex flex-col items-center justify-center shadow-2xl relative"
        >
          {/* Este div interno es meramente estético para el placeholder */}
          <div className="flex flex-col items-center gap-4 opacity-50 z-10 text-center px-4">
            <svg className="w-12 h-12 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-sans font-bold tracking-[0.2em] text-xs uppercase text-[#E6C987]">
              Módulo de Calendly para Escuelas
            </p>
            <p className="text-xs text-brand-white-300 max-w-md">
              (El iframe o script de integración de Calendly se inyectará en este contenedor para evitar alteraciones en el Layout).
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#111111] via-transparent to-[#C5A059]/5" />
        </motion.div>
      </section>

    </main>
  );
}