// src/components/layout/AvisoBanner.tsx
export default function AvisoBanner({ mensaje }: { mensaje: string }) {
  return (
    <div className="bg-accent-gold-vibrant text-black text-center py-2 px-4 text-sm font-sans font-semibold tracking-wide">
      {mensaje}
    </div>
  );
}