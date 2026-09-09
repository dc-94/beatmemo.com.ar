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
  max?: number;
  variant?: "light" | "dark";
  /** true = solo ícono siempre (para grillas muy chicas). Por defecto es responsive. */
  compact?: boolean;
}

const BADGES = [
  { key: "es_vegano", label: "Vegano", Icon: Sprout },
  { key: "es_vegetariano", label: "Vegetariano", Icon: Leaf },
  { key: "es_sin_tacc", label: "Sin TACC", Icon: WheatOff },
  { key: "es_nuevo", label: "Nuevo", Icon: Sparkles },
  { key: "es_recomendado", label: "Recomendado", Icon: Star },
] as const;

export default function AtributoBadges({ item, max, variant = "light", compact = false }: Props) {
  const activos = BADGES.filter((b) => item[b.key as keyof typeof item]);
  if (activos.length === 0) return null;

  const visibles = max ? activos.slice(0, max) : activos;
  const ocultos = activos.length - visibles.length;

  // Clases estáticas (Tailwind las compila). Nada de template con split().
  const estilo = variant === "dark"
    ? "text-[#E6C987] border-[#E6C987]/40"
    : "text-[#7D6841] border-[#7D6841]/40";
  const extra = variant === "dark" ? "text-[#E6C987]/70" : "text-[#7D6841]/70";

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {visibles.map(({ key, label, Icon }) => (
        <span
          key={key}
          title={label}
          className={`inline-flex items-center gap-1 uppercase tracking-widest font-bold border ${estilo} rounded-none text-[9px] p-1 sm:px-2 sm:py-1`}
        >
          <Icon size={11} strokeWidth={2.2} aria-hidden="true" />
          {/* Móvil: solo ícono. Desktop (sm+): ícono + texto. Salvo compact. */}
          {!compact && <span className="hidden sm:inline">{label}</span>}
        </span>
      ))}
      {ocultos > 0 && (
        <span className={`inline-flex items-center text-[9px] uppercase font-bold ${extra} px-1.5 py-1`}>
          +{ocultos}
        </span>
      )}
    </div>
  );
}