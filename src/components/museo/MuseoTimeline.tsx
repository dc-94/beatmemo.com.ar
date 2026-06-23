"use client";
import { motion } from "framer-motion";

export default function MuseoTimeline({ events }: { events: any[] }) {
  return (
    <div className="flex flex-col gap-24 lg:gap-32">
      {events.map((event, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            key={index} 
            className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${isEven ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className="hidden lg:block absolute left-1/2 top-1/2 w-4 h-4 bg-brand-black-200 border-2 border-[#C5A059] rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0_0_15px_rgba(197,160,89,0.5)]" />
            <div className="w-full pl-12 lg:pl-0 lg:w-1/2">
                {/* Aquí va tu componente de Imagen que tenías antes */}
            </div>
            <div className={`w-full pl-12 lg:pl-0 lg:w-1/2 flex flex-col ${isEven ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16'}`}>
              <span className="font-serif italic text-4xl lg:text-5xl text-[#C5A059]/20 mb-[-10px] lg:mb-[-15px] z-0">{event.year}</span>
              <h3 className="font-serif font-bold text-2xl lg:text-3xl text-[#E6C987] z-10 mb-4">{event.title}</h3>
              <p className="text-brand-white-300 text-sm lg:text-base leading-relaxed">{event.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}