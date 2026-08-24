// src/components/ui/Button.tsx
// Botón centralizado del admin. Una sola fuente de verdad para los estilos:
// cambiar un color acá se refleja en todo el panel.
// Variantes: primary (acción principal, blanco), danger (destructivo, rojo),
// secondary (acción alterna, gris), ghost (terciario, sin fondo).
import { forwardRef } from "react";

type Variant = "primary" | "danger" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  // Blanco sólido: máxima visibilidad sobre el dark. Acción principal.
  primary: "bg-white hover:bg-neutral-200 text-neutral-900 font-bold disabled:opacity-50",
  // Rojo contenido: destructivo. Borde rojo tenue, texto rojo, fondo oscuro.
  danger: "bg-neutral-950 border border-red-900/50 hover:bg-red-950 text-red-500 font-semibold disabled:opacity-50",
  // Gris: acción secundaria (gestionar, alternar). No compite con la principal.
  secondary: "bg-neutral-800 hover:bg-neutral-700 text-white font-semibold disabled:opacity-50",
  // Sin fondo: acción terciaria (cancelar, links de acción).
  ghost: "bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white font-medium disabled:opacity-50",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-4 py-3 text-sm",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;