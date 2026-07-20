// src/components/shared/SellosAccesibilidad.tsx
// Sellos de accesibilidad/confianza. Reemplaza el Banner de PNGs.
// variant="strip" → tira fina para el home. variant="block" → columna del footer.
import { WheatOff, Dog, Bike, Landmark } from "lucide-react";

const SELLOS = [
  { Icon: WheatOff, label: "Opciones Sin TACC" },
  { Icon: Dog, label: "Pet Friendly" },
  { Icon: Bike, label: "Bike Friendly" },
  { Icon: Landmark, label: "Espacio Cultural" },
] as const;

export default function SellosAccesibilidad({
  variant = "strip",
}: {
  variant?: "strip" | "block";
}) {
  if (variant === "block") {
    // Footer: columna vertical con ícono + texto, alineada al resto del footer.
    return (
      <div className="flex flex-col">
        <h3 className="text-brand-white-100 font-sans font-bold tracking-widest uppercase mb-4 text-sm">
          Un espacio para todos
        </h3>
        <ul className="flex flex-col gap-3">
          {SELLOS.map(({ Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-brand-white-200 font-sans text-sm">
              <Icon size={18} className="text-brand-gold shrink-0" strokeWidth={1.8} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Home: tira fina horizontal, íconos monocromos tenues, se apila en móvil.
  return (
    <section className="w-full border-y border-brand-white-300/10 py-4" aria-label="Características del local">
      <ul className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 sm:gap-x-12">
        {SELLOS.map(({ Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-brand-white-300 text-xs sm:text-sm font-sans tracking-wide">
            <Icon size={16} className="text-brand-gold/80 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}