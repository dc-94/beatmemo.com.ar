// src/components/home/PromoCard.tsx
// Card única de promoción, dos ramas visuales según decisión "A":
//   - CON imagen_url  → card-imagen (foto de fondo + texto encima)
//   - SIN imagen_url  → card-CSS (logo de banco o ícono + texto sobre color)
// Microdata schema.org/Offer inline: sin página /promos, el SEO vive acá.
// Se reutiliza en el admin como preview (misma card = preview real).
"use client";

import Image from "next/image";
import { Landmark, Clock, Tag, Sparkles, CalendarClock } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { resolvePromoAlt, promoTieneImagen, resolveVencimiento, isPromoVigente, proximaVigencia, type PromoData } from "@/lib/promo-helpers";


const DIAS_LABEL: Record<number, string> = {
  1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom",
};

function iconoPorTipo(tipo: string) {
  if (tipo === "banco") return Landmark;
  if (tipo === "fecha_especial") return Sparkles;
  return Tag; // local
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

// Logo del banco/entidad. Se recomienda PNG transparente (la leyenda está en
// el drawer). object-contain para no recortar.
function LogoBanco({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="relative h-10 w-28">
      <Image src={url} alt={alt} fill className="object-contain object-left" sizes="112px" />
    </div>
  );
}

// Chip de vencimiento. Solo se renderiza si resolveVencimiento devolvió texto
// (promo que vence en ≤30 días). Formato "Hasta el 14/2".
function ChipVencimiento({ texto, sobreImagen }: { texto: string; sobreImagen: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
      sobreImagen ? "text-accent-gold-light" : "text-accent-gold-vibrant"
    }`}>
      <CalendarClock size={12} /> {texto}
    </span>
  );
}

interface Props {
  promo: PromoData & { id?: string };
  /** preview en admin: idéntico al home (el admin agrega su overlay afuera) */
  preview?: boolean;
}

export default function PromoCard({ promo, preview = false }: Props) {
  const conImagen = promoTieneImagen(promo);
  const dias = textoDias(promo.dias_semana);
  const vigente = isPromoVigente(promo);
  const vencimiento = vigente ? resolveVencimiento(promo) : null;
  const cuandoVuelve = vigente ? null : proximaVigencia(promo);
  const Icon = iconoPorTipo(promo.tipo);

  const apagada = !vigente && !preview;

  const inner = conImagen ? (
    // ── RAMA IMAGEN ──────────────────────────────────────────────
    <article
      itemScope
      itemType="https://schema.org/Offer"
      className={`group relative overflow-hidden rounded-sm bg-neutral-900 aspect-[16/10] w-full h-full transition ${
        apagada ? "grayscale opacity-45" : ""
      }`}
    >
      <Image
        src={getOptimizedImageUrl(promo.imagen_url!, 640, 400)}
        alt={resolvePromoAlt(promo)}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 85vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        {promo.entidad && (
          <span className="text-accent-gold-vibrant text-[10px] uppercase font-bold tracking-widest mb-1">
            {promo.entidad}
          </span>
        )}
        <h3 itemProp="name" className="font-sans font-bold text-white text-lg lg:text-xl uppercase tracking-wide leading-tight mb-1">
          {promo.titulo}
        </h3>
        {promo.descripcion && (
          <p itemProp="description" className="font-sans text-white/85 text-xs lg:text-sm line-clamp-2 mb-2">
            {promo.descripcion}
          </p>
        )}
        {apagada && cuandoVuelve && (
        <div className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded">
          {cuandoVuelve}
        </div>
      )}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-white/70 text-[11px] font-medium">
            <Clock size={12} /> {dias}
          </span>
            {vencimiento && <ChipVencimiento texto={vencimiento} sobreImagen />}

        </div>
      </div>
      {promo.fecha_hasta && <meta itemProp="priceValidUntil" content={promo.fecha_hasta} />}
      <meta itemProp="availability" content="https://schema.org/InStock" />
      <meta itemProp="seller" content="Beatmemo" />
    </article>
  ) : (
    // ── RAMA CSS (banco / sin imagen) ────────────────────────────
    <article
      itemScope
      itemType="https://schema.org/Offer"
      className={`group relative overflow-hidden rounded-sm aspect-[16/10] w-full h-full bg-brand-black-200 border border-white/10 flex flex-col justify-between p-5 transition-colors hover:border-accent-gold-vibrant/40 ${apagada ? "grayscale opacity-45" : ""}`}
    >
      <div className="flex items-center justify-between">
        {promo.logo_url ? (
          <LogoBanco url={promo.logo_url} alt={resolvePromoAlt(promo)} />
        ) : (
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-accent-gold-vibrant">
            <Icon size={18} />
          </span>
        )}
        {promo.entidad && !promo.logo_url && (
          <span itemProp="seller" className="text-accent-gold-vibrant text-[10px] uppercase font-bold tracking-widest">
            {promo.entidad}
          </span>
        )}
      </div>

      <div>
        <h3 itemProp="name" className="font-sans font-bold text-white text-lg lg:text-xl uppercase tracking-wide leading-tight mb-1">
          {promo.titulo}
        </h3>
        {promo.descripcion && (
          <p itemProp="description" className="font-sans text-white/70 text-xs lg:text-sm line-clamp-2 mb-2">
            {promo.descripcion}
          </p>
        )}
        {apagada && cuandoVuelve && (
        <div className="absolute top-3 right-3 z-10 bg-black/80 text-accent-gold-light text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded">
          {cuandoVuelve}
        </div>
      )}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-white/50 text-[11px] font-medium">
            <Clock size={12} /> {dias}
          </span>
            {vencimiento && <ChipVencimiento texto={vencimiento} sobreImagen />}

        </div>
      </div>
      {promo.fecha_hasta && <meta itemProp="priceValidUntil" content={promo.fecha_hasta} />}
      <meta itemProp="availability" content="https://schema.org/InStock" />
    </article>
  );

  return <div className="w-full h-full">{inner}</div>;
}