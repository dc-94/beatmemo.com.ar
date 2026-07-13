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
}

// Badges visuales (no filtran, solo informan). Se muestran solo los activos.
// Un item puede tener varios a la vez (ej: vegano + sin TACC).
const BADGES = [
  { key: "es_vegano", label: "Vegano", Icon: Sprout },
  { key: "es_vegetariano", label: "Vegetariano", Icon: Leaf },
  { key: "es_sin_tacc", label: "Sin TACC", Icon: WheatOff },
  { key: "es_nuevo", label: "Nuevo", Icon: Sparkles },
  { key: "es_recomendado", label: "Recomendado", Icon: Star },
] as const;

export default function AtributoBadges({ item }: Props) {
  const activos = BADGES.filter((b) => item[b.key as keyof typeof item]);
  if (activos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {activos.map(({ key, label, Icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-[#A68966] border border-[#A68966]/30 px-2 py-1 rounded-none"
        >
          <Icon size={11} strokeWidth={2.2} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}