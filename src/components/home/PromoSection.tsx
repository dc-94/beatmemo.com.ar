// src/components/home/PromoSection.tsx
import { publicClient } from "@/lib/supabase/public";
import { isPromoVigente, type PromoData } from "@/lib/promo-helpers";
import PromoCard from "./PromoCard";

export default async function PromoSection() {
  const { data, error } = await publicClient
    .from("promociones")
    .select("id, tipo, titulo, descripcion, entidad, imagen_url, logo_url, alt_texto, dias_semana, fecha_desde, fecha_hasta, activo, prioridad")
    .eq("is_deleted", false)
    .eq("activo", true)
    .order("prioridad", { ascending: false });

  if (error) {
    console.error("[DATA_ERROR][PromoSection]", JSON.stringify(error));
    try {
      await publicClient.rpc("log_system_error", {
        p_message: `[PromoSection] ${error.message}`,
        p_stack: error.details ?? null,
        p_dedup_key: `promos:home:${error.code ?? "UNKNOWN"}`,
      });
    } catch { /* el logueo nunca rompe el render */ }
    return null;
  }

  // Filtro de vigencia (fecha + día) en el server, con la lógica compartida.
  // La query ya trajo solo activas; acá se aplica el "¿aplica HOY?".
  const vigentes = (data ?? []).filter((p) => isPromoVigente(p as PromoData));

  // Tope de 4 en el home (las de mayor prioridad). Coherente con la barra:
  // más que esto no es "promo destacada", es catálogo.
  const promos = vigentes.slice(0, 4);

  if (promos.length === 0) return null; // sin promos hoy → sección no existe

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Promociones vigentes">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-accent-gold-vibrant animate-pulse" />
        <h2 className="font-sans font-bold text-accent-gold-vibrant tracking-widest text-xs uppercase">
          Promos de hoy
        </h2>
      </div>

      {/* DESKTOP: grilla de hasta 4 a lo ancho */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {promos.map((p) => (
          <PromoCard key={p.id} promo={p as PromoData & { id: string }} />
        ))}
      </div>

      {/* MÓVIL: scroll horizontal con peek (se ve ~1.5), sin flechas */}
      <div className="sm:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 -mx-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {promos.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[75%]">
            <PromoCard promo={p as PromoData & { id: string }} />
          </div>
        ))}
      </div>
    </section>
  );
}