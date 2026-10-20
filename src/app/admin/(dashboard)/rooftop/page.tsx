export const dynamic = "force-dynamic";
import RooftopMarcasSection from "@/components/admin/rooftop/RooftopMarcasSection";
// import RooftopHeroSection from "@/components/admin/rooftop/RooftopHeroSection";

export default function RooftopAdminPage() {
  return (
    // PADRE: ancho, ritmo y comportamiento móvil se definen UNA sola vez acá
    <div className="space-y-10 max-w-3xl">
      <header>
        <h1 className="text-2xl font-serif text-white">Rooftop</h1>
        <p className="text-neutral-400 text-sm">Marcas, secciones e imágenes del rooftop.</p>
      </header>

      <RooftopMarcasSection />
      {/* <RooftopHeroSection /> ← las próximas se cuelgan acá, sin tocar nada de arriba */}
    </div>
  );
}