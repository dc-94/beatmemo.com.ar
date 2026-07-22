// src/components/home/PromoCard.tsx
// Card de promoción, dos ramas:
//   - CON imagen_url  → card-foto (imagen de fondo + degradé)
//   - SIN imagen_url  → card-CLARA (crema + logo izq + texto der)
// Paleta invertida en la rama clara: los logos de banco están diseñados para
// fondo blanco, y sobre el negro del body la card se perdía.
// El badge vive FUERA del wrapper atenuado, para que siempre sea legible.
"use client";

import Image from "next/image";
import { Landmark, Tag, Sparkles, CalendarClock } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import {
  resolvePromoAlt, promoTieneImagen, resolveVencimiento,
  isPromoVigente, proximaVigencia, type PromoData,
} from "@/lib/promo-helpers";

const DIAS_LABEL: Record<number, string> = {
  1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom",
};

function iconoPorTipo(tipo: string) {
  if (tipo === "banco") return Landmark;
  if (tipo === "fecha_especial") return Sparkles;
  return Tag;
}

function textoDias(dias: number[] | null): string {
  if (!dias || dias.length === 0) return "Todos los días";
  if (dias.length === 1) {
    const full: Record<number, string> = {
      1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábados", 7: "Domingos",
    };
    return full[dias[0]] ?? "";
  }
  const sorted = [...dias].sort((a, b) => a - b);
  const contiguo = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
  if (contiguo) return `${DIAS_LABEL[sorted[0]]} a ${DIAS_LABEL[sorted[sorted.length - 1]]}`;
  return sorted.map((n) => DIAS_LABEL[n]).join(", ");
}

interface Props {
  promo: PromoData & { id?: string };
  preview?: boolean;
}

export default function PromoCard({ promo, preview = false }: Props) {
  const conImagen = promoTieneImagen(promo);
  const vigente = isPromoVigente(promo);
  const vencimiento = vigente ? resolveVencimiento(promo) : null;
  const cuandoVuelve = vigente ? null : proximaVigencia(promo);
  const Icon = iconoPorTipo(promo.tipo);

  const apagada = !vigente && !preview;
  const badgeTexto = vigente ? textoDias(promo.dias_semana) : cuandoVuelve;

  return (
    <div className="relative w-full h-full">
      {/* CONTENIDO — atenuado por desaturación parcial, no grayscale total.
          El badge de afuera ya comunica "hoy no", así que la card no necesita
          estar muerta: solo apagada. */}
      <div className={`w-full h-full transition duration-500 ${
        apagada ? "saturate-[0.7] opacity-80" : ""
      }`}>
        {conImagen ? (
          // ── RAMA FOTO ──
          <article
            itemScope itemType="https://schema.org/Offer"
            className="group relative overflow-hidden rounded-sm bg-neutral-900 aspect-[32/15] w-full h-full"
          >
            <Image
              src={getOptimizedImageUrl(promo.imagen_url!, 640, 300)}
              alt={resolvePromoAlt(promo)}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 85vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              {promo.entidad && (
                <span className="text-accent-gold-light text-[10px] uppercase font-bold tracking-widest mb-0.5">
                  {promo.entidad}
                </span>
              )}
              <h3 itemProp="name" className="font-sans font-bold text-white text-base lg:text-lg uppercase tracking-wide leading-tight">
                {promo.titulo}
              </h3>
              {promo.descripcion && (
                <p itemProp="description" className="font-sans text-white/65 text-[10px] leading-snug line-clamp-1 mt-1">
                  {promo.descripcion}
                </p>
              )}
              {vencimiento && (
                <span className="inline-flex items-center gap-1 text-accent-gold-light text-[11px] font-bold mt-1.5">
                  <CalendarClock size={12} /> {vencimiento}
                </span>
              )}
            </div>
            {promo.fecha_hasta && <meta itemProp="priceValidUntil" content={promo.fecha_hasta} />}
            <meta itemProp="availability" content="https://schema.org/InStock" />
            <meta itemProp="seller" content="Beatmemo" />
          </article>
        ) : (
          // ── RAMA CLARA: logo grande a la izquierda, texto a la derecha ──
          <article
            itemScope itemType="https://schema.org/Offer"
            className="group relative overflow-hidden rounded-sm aspect-[32/15] w-full h-full
                       bg-[#F5F1E8] border border-black/5 shadow-sm
                       flex flex-row items-center gap-4 p-4
                       transition-shadow hover:shadow-md"
          >
            {/* LOGO — izquierda, protagonista */}
            <div className="shrink-0">
              {promo.logo_url ? (
                <div className="relative h-14 w-24">
                  <Image src={promo.logo_url} alt="" fill className="object-contain object-center" sizes="96px" />
                </div>
              ) : (
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-black-100/5 text-brand-gold">
                  <Icon size={24} strokeWidth={1.6} />
                </span>
              )}
            </div>

            {/* TEXTO — derecha, todo junto */}
            <div className="min-w-0 flex-1">
              {promo.entidad && (
                <span itemProp="seller" className="block text-brand-gold text-[10px] uppercase font-bold tracking-widest mb-0.5 truncate">
                  {promo.entidad}
                </span>
              )}
              <h3 itemProp="name" className="font-sans font-bold text-brand-black-100 text-base lg:text-md uppercase tracking-tight leading-tight">
                {promo.titulo}
              </h3>
              {/* Descripción como letra chica de términos */}
              {promo.descripcion && (
                <p itemProp="description" className="font-sans text-brand-black-300 text-[10px] leading-snug line-clamp-2 mt-1">
                  {promo.descripcion}
                </p>
              )}
              {vencimiento && (
                <span className="inline-flex items-center gap-1 text-brand-red-100 text-[11px] font-bold mt-1">
                  <CalendarClock size={12} /> {vencimiento}
                </span>
              )}
            </div>
            {promo.fecha_hasta && <meta itemProp="priceValidUntil" content={promo.fecha_hasta} />}
            <meta itemProp="availability" content="https://schema.org/InStock" />
          </article>
        )}
      </div>

      {/* BADGE — fuera del atenuado. Chico y discreto, mismo chip oscuro en
          ambos estados; solo cambia el color del texto. */}
      {badgeTexto && (
        <div className={`absolute top-2 right-2 z-20 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm backdrop-blur-sm bg-brand-black-100/85 ${
          vigente ? "text-accent-gold-light" : "text-brand-black-100 bg-brand-white-200"
        }`}>
          {badgeTexto}
        </div>
      )}
    </div>
  );
}