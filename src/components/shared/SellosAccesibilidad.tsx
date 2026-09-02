// src/components/shared/SellosAccesibilidad.tsx

import { WheatOff, Dog, Bike, Landmark, Leaf } from "lucide-react";

const SELLOS = [
  { Icon: Dog, label: "Pet Friendly" },
  { Icon: Bike, label: "Bike Friendly" },
  { Icon: WheatOff, label: "Sin TACC" },
  { Icon: Leaf, label: "Vegetariano"},
  { Icon: Landmark, label: "Espacio Cultural" },
] as const;

export default function SellosAccesibilidad({
  variant = "strip",
  surface = "dark",
}: {
  variant?: "strip" | "block";
  surface?: "dark" | "light";
}) {
  const light = surface === "light";

  if (variant === "block") {
    return (
      <div className="flex flex-col">
        <h3 className={`font-sans font-bold tracking-widest uppercase mb-4 text-sm ${light ? "text-brand-black-100" : "text-brand-white-100"}`}>
          Un espacio para todos
        </h3>
        <ul className="flex flex-col gap-3">
          {SELLOS.map(({ Icon, label }) => (
            <li key={label} className={`flex items-center gap-3 font-sans text-sm ${light ? "text-[#5C5852]" : "text-brand-white-200"}`}>
              <Icon size={18} className={`shrink-0 ${light ? "text-[#8A6D2F]" : "text-brand-gold"}`} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section
      className={`w-full border-y py-4 ${light ? "border-brand-black-100/20 " : "border-brand-white-300/10"}`}
      aria-label="Características del local"
    >
      <ul className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 sm:gap-x-12">
        {SELLOS.map(({ Icon, label }) => (
          <li key={label} className={`flex items-center gap-2 text-xs sm:text-sm font-sans tracking-wide ${light ? "text-[#5C5852]" : "text-brand-white-300"}`}>
            <Icon size={16} className={`shrink-0 ${light ? "text-[#8A6D2F]" : "text-brand-gold/80"}`} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}