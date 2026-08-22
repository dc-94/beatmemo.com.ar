// src/components/pub/AtributoBadges.tsx
import { Leaf, Sprout, WheatOff, Sparkles, Star } from "lucide-react";

interface Props {
  item: {
    es_vegetariano?: boolean;
    es_vegano?: boolean;
    es_sin_tacc?: boolean;
    es_nuevo?: boolean;
    es_recomendado?: boolean;
  };
  compact?: boolean;
  max?: number;
  variant?: "light" | "dark";

}

const BADGES = [
  { key: "es_vegano", label: "Vegano", Icon: Sprout },
  { key: "es_vegetariano", label: "Vegetariano", Icon: Leaf },
  { key: "es_sin_tacc", label: "Sin TACC", Icon: WheatOff },
  { key: "es_nuevo", label: "Nuevo", Icon: Sparkles },
  { key: "es_recomendado", label: "Recomendado", Icon: Star },
] as const;

export default function AtributoBadges({ item, compact = false, max , variant = "light" }: Props) {
  const activos = BADGES.filter((b) => item[b.key as keyof typeof item]);
  if (activos.length === 0) return null;

  const visibles = max ? activos.slice(0, max) : activos;
  const ocultos = activos.length - visibles.length;

  const color = variant === "dark"
    ? "text-[#E6C987] border-[#E6C987]/40"
    : "text-[#A68966] border-[#A68966]/30";
  const colorExtra = variant === "dark" ? "text-[#E6C987]/70" : "text-[#A68966]/70";


  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {visibles.map(({ key, label, Icon }) => (
        <span
          key={key}
          title={compact ? label : undefined}
          aria-label={compact ? label : undefined}
          className={`inline-flex items-center gap-1 uppercase tracking-widest font-bold ${color} border border-${color.split('/')[0].split(' ')[1]}/30 rounded-none ${
            compact ? "p-1" : "text-[9px] px-2 py-1"
          }`}
        >
          <Icon size={11} strokeWidth={2.2} aria-hidden="true" />
          {!compact && label}
        </span>
      ))}
      {ocultos > 0 && (
        <span className={`inline-flex items-center text-[9px] uppercase font-bold ${colorExtra} px-1.5 py-1`}>
          +{ocultos}
        </span>
      )}
    </div>
  );
}