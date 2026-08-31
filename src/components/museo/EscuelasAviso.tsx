// src/components/museo/EscuelasAviso.tsx
// Aviso de reservas de escuelas. Misma fuente (config_sitio.museo_visitas.escuelas),
// se usa en home, /museo y /museo/visitas-guiadas. El mensaje se renderiza como
// text node → React lo escapa → sin XSS, sin sanitizer.
import { whatsappLink } from "@/lib/config";
import type { MuseoVisitas } from "@/lib/site-config";

export default function EscuelasAviso({
  escuelas,
  variant = "inline",
}: {
  escuelas: MuseoVisitas["escuelas"];
  variant?: "inline" | "block";
}) {
  const wa = escuelas.mostrar_whatsapp ? (
    
      <a href={whatsappLink("Hola, quiero consultar por visitas guiadas para instituciones educativas.")}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 w-fit font-sans font-bold text-[#E6C987] border-b border-[#E6C987] pb-0.5 hover:text-brand-white-100 hover:border-brand-white-100 transition-colors"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.553 4.195 1.604 6.015L.302 24l6.108-1.599A11.96 11.96 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0z"/></svg>
      Consultar por WhatsApp
    </a>
  ) : null;

  if (variant === "block") {
    return (
      <div className="w-full max-w-3xl mx-auto text-center bg-[#111111] border border-[#8B6D3B]/30 px-6 py-12">
        <span className="block font-sans font-bold tracking-[0.2em] uppercase text-xs text-[#C5A059] mb-4">
          Reservas temporalmente cerradas
        </span>
        <p className="font-serif text-xl lg:text-2xl text-brand-white-100 leading-relaxed mb-6 max-w-xl mx-auto">
          {escuelas.mensaje}
        </p>
        {wa}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-1">
      <p className="text-brand-white-300 text-[13px] leading-relaxed">{escuelas.mensaje}</p>
      {wa}
    </div>
  );
}