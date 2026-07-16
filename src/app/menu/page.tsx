// src/app/menu/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { headers } from "next/headers";
import { Star, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PdfViewer from "@/components/menu/PdfViewer";
import { GOOGLE_REVIEW_URL } from "@/lib/config";
export const metadata: Metadata = {
  title: "Carta Digital",
  description: "Nuestras cartas: cocina, barra, happy hour y whisky collection.",
};

export const revalidate = 300;

interface Menu {
  id: string;
  tipo: string;
  nombre: string;
  url_archivo: string;
  version: number;
  orden: number;
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const qrPrefix = process.env.NEXT_PUBLIC_QR_SUBDOMAIN_PREFIX || "qr.";
  const isQr = host.startsWith(qrPrefix);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beatmemo.com";

  const supabase = await createClient();
  const { data } = await supabase
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

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C2924]">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* LOGO MÍNIMO — solo en QR (en web ya está la navbar del sitio) */}
        {isQr && (
          <div className="flex justify-center mb-5">
            <Link href={siteUrl} aria-label="Beatmemo">
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
                    href={`/menu?tipo=${m.tipo}`}
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
        {/* Reseña: en ambos contextos. "Ver sitio completo": solo QR
            (desde la web ya estás en el sitio). */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 mb-4">
          
          <a href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#C5A059] text-black px-6 py-3.5 font-bold uppercase tracking-widest text-[11px] hover:bg-[#E6C987] transition-colors"
          >
            <Star size={14} /> Dejanos tu reseña
          </a>
          {isQr && (
            <Link
              href={siteUrl}
              className="flex-1 flex items-center justify-center gap-2 border border-[#A68966] text-[#A68966] px-6 py-3.5 font-bold uppercase tracking-widest text-[11px] hover:bg-[#A68966] hover:text-white transition-colors"
            >
              Ver sitio completo <ArrowRight size={14} />
            </Link>
          )}
      </div>
      </div>
    </main>
  );
}