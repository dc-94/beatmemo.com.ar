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
  // compact: solo ícono, sin texto. Para cards angostas (bento horizontal).
  // Los atributos de alergia NO se ocultan nunca — solo se comprimen a ícono.
  compact?: boolean;
  // max: tope de badges visibles. Si sobran, muestra "+N". Default: todos.
  max?: number;
}

const BADGES = [
  { key: "es_vegano", label: "Vegano", Icon: Sprout },
  { key: "es_vegetariano", label: "Vegetariano", Icon: Leaf },
  { key: "es_sin_tacc", label: "Sin TACC", Icon: WheatOff },
  { key: "es_nuevo", label: "Nuevo", Icon: Sparkles },
  { key: "es_recomendado", label: "Recomendado", Icon: Star },
] as const;

export default function AtributoBadges({ item, compact = false, max }: Props) {
  const activos = BADGES.filter((b) => item[b.key as keyof typeof item]);
  if (activos.length === 0) return null;

  const visibles = max ? activos.slice(0, max) : activos;
  const ocultos = activos.length - visibles.length;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {visibles.map(({ key, label, Icon }) => (
        <span
          key={key}
          title={compact ? label : undefined}
          aria-label={compact ? label : undefined}
          className={`inline-flex items-center gap-1 uppercase tracking-widest font-bold text-[#A68966] border border-[#A68966]/30 rounded-none ${
            compact ? "p-1" : "text-[9px] px-2 py-1"
          }`}
        >
          <Icon size={11} strokeWidth={2.2} aria-hidden="true" />
          {!compact && label}
        </span>
      ))}
      {ocultos > 0 && (
        <span className="inline-flex items-center text-[9px] uppercase font-bold text-[#A68966]/70 px-1.5 py-1">
          +{ocultos}
        </span>
      )}
    </div>
  );
}