// src/components/ui/BrandSpinner.tsx
export default function BrandSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 w-full min-h-[400px] bg-brand-black-100">
      {/* Círculo giratorio estilo "Vinilo" u oro */}
      <div className="w-12 h-12 border-4 border-brand-black-300 border-t-brand-gold rounded-full animate-spin mb-6"></div>
      
      {/* Texto latiendo */}
      <p className="text-brand-gold font-sans font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">
        Cargando Agenda...
      </p>
    </div>
  );
}