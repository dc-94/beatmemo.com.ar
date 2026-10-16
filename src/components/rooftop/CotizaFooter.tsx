// src/components/rooftop/CotizaFooter.tsx  (Server Component)
import { MapPin, Mail } from "lucide-react";
import { whatsappLink } from "@/lib/config";
import RooftopWordmarkLetters from "./RooftopWordmarkLetters";
import { ROOFTOP_WHATSAPP, ROOFTOP_CONTACT } from "@/lib/rooftop-data";

// Instagram y WhatsApp no están en lucide (sacaron los iconos de marca):
// reusamos los mismos glyphs inline que ya usa el Footer del sitio → consistencia.
function IgIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function WaIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const iconLink = "text-[#6d685f] hover:text-[#141211] transition";

export default function CotizaFooter() {
  return (
    <footer id="contacto" className="relative overflow-hidden bg-white pt-20 sm:pt-28 pb-10 text-center">
      {/* Logo gigante tenue: cada grupo del vector sube escalonado */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.07]">
        <RooftopWordmarkLetters className="w-[min(200%,2600px)] text-[#141211]" />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10">
        <p className="font-extrabold text-[0.72rem] tracking-[0.26em] uppercase text-[#b4ac9c] mb-2">Reservá tu fecha</p>
        <h2 className="font-black text-[clamp(2.2rem,8vw,4.6rem)] uppercase tracking-tight leading-none text-[#141211] mb-4">
          Cotizá tu <span className="font-extralight">evento</span>
        </h2>
        <p className="text-[#6d685f] max-w-[42ch] mx-auto mb-8">Contanos qué tenés en mente y armamos una propuesta a tu medida.</p>

        <div className="flex gap-3 justify-center flex-wrap">
          <a href="#cotizar" className="bg-[#141211] text-white px-8 py-3.5 uppercase tracking-[0.14em] font-bold text-[0.76rem] hover:bg-black transition">
            Pedir cotización
          </a>
          <a href={whatsappLink("Hola! Quiero consultar por eventos en Beatmemo Rooftop.", ROOFTOP_WHATSAPP)} target="_blank" rel="noopener noreferrer"
            className="border border-[#141211] text-[#141211] px-8 py-3.5 uppercase tracking-[0.14em] font-bold text-[0.76rem] hover:bg-[#141211] hover:text-white transition">
            WhatsApp directo
          </a>
        </div>

        <div className="flex gap-6 justify-center mt-9">
          <a href={ROOFTOP_CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={iconLink}><IgIcon /></a>
          <a href={whatsappLink("Hola! Quiero consultar por eventos en Beatmemo Rooftop.", ROOFTOP_WHATSAPP)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={iconLink}><WaIcon /></a>
          <a href={ROOFTOP_CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar" className={iconLink}><MapPin size={20} strokeWidth={1.75} /></a>
          <a href={`mailto:${ROOFTOP_CONTACT.email}`} aria-label="Email" className={iconLink}><Mail size={20} strokeWidth={1.75} /></a>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E6E2D8] flex gap-x-10 gap-y-5 justify-center flex-wrap text-[0.8rem] text-[#6d685f]">
          <span><b className="text-[#141211] font-semibold">{ROOFTOP_CONTACT.direccion}</b> · {ROOFTOP_CONTACT.ciudad}</span>
          <span>{ROOFTOP_CONTACT.instagram}</span>
          <span>{ROOFTOP_CONTACT.telefono}</span>
          <span>{ROOFTOP_CONTACT.email}</span>
        </div>
      </div>
    </footer>
  );
}