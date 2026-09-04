// src/components/menu/MenuView.tsx
// Visor de cartas compartido por dos entradas:
//   /menu  → web, con chrome del sitio (isQr = false)
//   /qr    → subdominio QR, sin chrome (isQr = true)
// El contexto llega como PROP, no se deduce con headers(): eso era lo que
// ataba la página a render dinámico e impedía sacar headers() del layout.
import Link from "next/link";
import Image from "next/image";
import { publicClient } from "@/lib/supabase/public";
import PdfViewer from "@/components/menu/PdfViewer";
import { Star, CalendarDays,ArrowRight ,MessageCircle } from "lucide-react";
import { GOOGLE_REVIEW_URL, SITE_URL, SOCIAL, whatsappLink, WA_MESSAGES } from "@/lib/config";

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

  // CRÍTICO: en el QR la URL visible es qr.beatmemo.com.ar/
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

        {/* CTAs — jerarquía deliberada: una acción principal, una secundaria,
            accesorios abajo. Seis botones del mismo peso = ninguno se toca. */}
        <div className="mt-2 mb-4 space-y-3">          
           <a href={whatsappLink(WA_MESSAGES.reservaMesa)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#2C2924] text-[#FAF7F2] px-6 py-3.5 font-bold uppercase tracking-widest text-[11px] hover:bg-[#413c35] transition-colors"
          >
            <MessageCircle size={14} /> Reservá tu mesa
          </a>

          {/* SECUNDARIO — solo QR: en la web el navbar ya lleva a la agenda. */}
          {isQr && (
            
            <a  href={`${SITE_URL}/agenda`}
              className="w-full flex items-center justify-center gap-2 border border-[#A68966] text-[#A68966] px-6 py-3.5 font-bold uppercase tracking-widest text-[11px] hover:bg-[#A68966] hover:text-white transition-colors"
            >
              <CalendarDays size={14} /> Ver agenda de shows
            </a>
          )}

          {/* TERCIARIO — reseña */}
          
          <a  href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#C5A059] text-black px-6 py-3.5 font-bold uppercase tracking-widest text-[11px] hover:bg-[#E6C987] transition-colors"
          >
            <Star size={14} /> Dejanos tu reseña
          </a>
        </div>
                  {/* ACCESORIOS — redes + salida al sitio, íconos chicos que no compiten */}
          {isQr && (
            <div className="flex items-center justify-between pt-3 border-t border-[#D1CCC0]/50 mt-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-widest text-[#8A857C] mr-1">Seguinos</span>

                {SOCIAL.instagram && (
                  
                   <a href={SOCIAL.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-11 h-11 flex items-center justify-center text-[#5C5852] hover:text-[#A68966] transition-colors"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.31-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.4-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88" />
                    </svg>
                  </a>
                )}

                {SOCIAL.facebook && (
                  
                  <a  href={SOCIAL.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-11 h-11 flex items-center justify-center text-[#5C5852] hover:text-[#A68966] transition-colors"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.24h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
                    </svg>
                  </a>
                )}

                
                <a  href={whatsappLink("Hola, quiero hacer una reserva.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-11 h-11 flex items-center justify-center text-[#5C5852] hover:text-[#A68966] transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                </a>
              </div>

              
               <a href={SITE_URL}
                className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#5C5852] hover:text-[#A68966] transition-colors px-2 py-2"
              >
                Ver sitio completo <ArrowRight size={12} />
              </a>
            </div>
          )}
      </div>
    </main>
  );
}