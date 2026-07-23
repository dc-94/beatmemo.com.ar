// src/components/menu/MenuView.tsx
// Visor de cartas compartido por dos entradas:
//   /menu  → web, con chrome del sitio (isQr = false)
//   /qr    → subdominio QR, sin chrome (isQr = true)
// El contexto llega como PROP, no se deduce con headers(): eso era lo que
// ataba la página a render dinámico e impedía sacar headers() del layout.
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, CalendarDays } from "lucide-react";
import { publicClient } from "@/lib/supabase/public";
import PdfViewer from "@/components/menu/PdfViewer";
import { GOOGLE_REVIEW_URL, SITE_URL, SOCIAL, whatsappLink } from "@/lib/config";

interface Menu {
  id: string;
  tipo: string;
  nombre: string;
  url_archivo: string;
  version: number;
  orden: number;
}

export default async function MenuView({
  tipo,
  isQr,
}: {
  tipo?: string;
  isQr: boolean;
}) {
  // Lectura pública: publicClient, sin cookies (Regla del cliente público).
  const { data } = await publicClient
    .from("menus")
    .select("id, tipo, nombre, url_archivo, version, orden")
    .eq("is_deleted", false)
    .eq("activo", true)
    .order("orden", { ascending: true });

  const menus = (data as Menu[]) ?? [];

  if (menus.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] text-[#2C2924] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-2xl">Estamos actualizando nuestra carta</h1>
          <p className="text-[#5C5852] text-sm">Volvé en un ratito, o consultanos por WhatsApp.</p>
        </div>
      </main>
    );
  }

  // ?tipo=basura cae a la primera carta: no rompe la página (anti-tampering).
  const activa = menus.find((m) => m.tipo === tipo) ?? menus[0];

  // CRÍTICO: en el QR la URL visible es qr.beatmemo.com.ar/, y el middleware
  // reescribe "/" → "/qr". Si los chips apuntaran a /menu, la navegación
  // saldría del contexto QR y volvería el chrome del sitio.
  const basePath = isQr ? "/" : "/menu";

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C2924]">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* LOGO MÍNIMO — solo en QR (en web ya está la navbar del sitio) */}
        {isQr && (
          <div className="flex justify-center mb-4">
            <Link href={SITE_URL} aria-label="Beatmemo">
              <Image
                src="/brand/logo_BLANCO.svg"
                alt="Beatmemo"
                width={120}
                height={28}
                style={{ width: "120px", height: "auto" }}
                className="invert"
                priority
              />
            </Link>
          </div>
        )}

        {/* CHIPS — Links con URL params: la URL gobierna el estado.
            Permite que el QR entre directo a una carta (?tipo=...). */}
        <nav aria-label="Cartas disponibles" className="mb-5">
          <ul className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:justify-center">
            {menus.map((m) => {
              const isActive = m.tipo === activa.tipo;
              return (
                <li key={m.id} className="shrink-0">
                  <Link
                     href={`${basePath}?tipo=${m.tipo}`}
                    scroll={false}
                    aria-current={isActive ? "page" : undefined}
                    className={`block px-4 py-2 text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                      isActive
                        ? "bg-[#2C2924] text-[#FAF7F2] border-[#2C2924]"
                        : "bg-transparent text-[#5C5852] border-[#D1CCC0] hover:border-[#A68966] hover:text-[#A68966]"
                    }`}
                  >
                    {m.nombre}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* VISOR — key fuerza remount al cambiar de carta */}
        <PdfViewer key={activa.id} url={activa.url_archivo} version={activa.version} />

        {/* Reseña: en ambos contextos. "Ver sitio completo": solo QR
            (desde la web ya estás en el sitio). */}
        {/* CTAs — jerarquía deliberada: una acción principal, una secundaria,
            accesorios abajo. Seis botones del mismo peso = ninguno se toca. */}
        <div className="mt-2 mb-4 space-y-3">
          {/* PRINCIPAL */}
          {/* SECUNDARIO — solo QR: en la web el navbar ya lleva a la agenda.
              URL absoluta porque desde qr. hay que salir al dominio principal. */}
          {isQr && (
            
            <a  href={`${SITE_URL}/agenda`}
              className="w-full flex items-center justify-center gap-2 border border-[#A68966] text-[#A68966] px-6 py-3.5 font-bold uppercase tracking-widest text-[11px] hover:bg-[#A68966] hover:text-white transition-colors"
            >
              <CalendarDays size={14} /> Ver agenda de shows
            </a>
          )}
          
           <a  href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#C5A059] text-black px-6 py-3.5 font-bold uppercase tracking-widest text-[11px] hover:bg-[#E6C987] transition-colors"
          >
            <Star size={14} /> Dejanos tu reseña
          </a>

          {/* ACCESORIOS — íconos chicos, sin competir con los botones */}
          {isQr && (
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-[#8A857C]">
                  Seguinos
                </span>
                
                <a   href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Beatmemo"
                  className="text-[#5C5852] hover:text-[#A68966] transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                
                <a   href={SOCIAL.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de Beatmemo"
                  className="text-[#5C5852] hover:text-[#A68966] transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href={whatsappLink("Hola! Quiero hacer una reserva.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Reservar por WhatsApp"
                  className="text-[#5C5852] hover:text-[#A68966] transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                </a>
              </div>

              {/* <a> y no <Link>: es cross-origin (qr. → dominio principal),
                  la navegación client-side de Next no aplica. */}
              
              <a   href={SITE_URL}
                className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#5C5852] hover:text-[#A68966] transition-colors"
              > Ver sitio completo <ArrowRight size={12} />
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}