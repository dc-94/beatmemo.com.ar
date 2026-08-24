// src/components/home/PromoSection.tsx
import { publicClient } from "@/lib/supabase/public";
import { isPromoVigente, type PromoData } from "@/lib/promo-helpers";
import PromoCard from "./PromoCard";

export default async function PromoSection() {
  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  const { data, error } = await publicClient
    .from("promociones")
    .select("id, tipo, titulo, descripcion, entidad, imagen_url, logo_url, alt_texto, dias_semana, fecha_desde, fecha_hasta, activo, prioridad")
    .eq("is_deleted", false)
    .eq("activo", true)
    .or(`fecha_hasta.is.null,fecha_hasta.gte.${hoyAr}`)
    .order("prioridad", { ascending: false });

  if (error) {
    console.error("[DATA_ERROR][PromoSection]", JSON.stringify(error));
    try {
      await publicClient.rpc("log_system_error", {
        p_message: `[PromoSection] ${error.message}`,
        p_stack: error.details ?? null,
        p_dedup_key: `promos:home:${error.code ?? "UNKNOWN"}`,
      });
    } catch {}
    return null;
  }

  const todas = (data ?? []) as PromoData[];
  if (todas.length === 0) return null;

  // Las vigentes HOY van primero (con su urgencia); las demás después,
  // apagadas. Dentro de cada grupo, respeta la prioridad ya ordenada.
  const ordenadas = [...todas].sort((a, b) => {
    const va = isPromoVigente(a) ? 0 : 1;
    const vb = isPromoVigente(b) ? 0 : 1;
    return va - vb;
  });

  const promos = ordenadas.slice(0, 6); // tope: vigentes + algunas próximas

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Promociones">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-accent-gold-vibrant animate-pulse" />
        <h2 className="font-sans font-bold text-accent-gold-vibrant tracking-widest text-xs uppercase">
          Promos de la semana
        </h2>
      </div>

      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {promos.map((p) => (
          <PromoCard key={(p as any).id} promo={p as PromoData & { id: string }} />
        ))}
      </div>

      <div className="sm:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {promos.map((p) => (
          <div key={(p as any).id} className="snap-start shrink-0 w-[78%]">
            <PromoCard promo={p as PromoData & { id: string }} />
          </div>
        ))}
        {/* Spacer: sin esto, la última card queda pegada al borde derecho
            (el padding-right no se respeta en flex scroll). */}
        <div className="shrink-0 w-px" aria-hidden="true" />
      </div>

    </section>
  );
}