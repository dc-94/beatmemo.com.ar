// src/lib/promo-helpers.ts
// Lógica compartida de promociones: resolución de ALT y vigencia.
// Vive en lib/ (no "use server") para que la usen el render público Y el admin.

export interface PromoData {
  tipo: string;
  titulo: string;
  descripcion: string | null;
  entidad: string | null;
  imagen_url: string | null;
  logo_url: string | null;
  alt_texto: string | null;
  dias_semana: number[] | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
  activo: boolean;
}

/**
 * ALT de la imagen de una promo. Solo relevante si hay imagen_url.
 * Prioridad: alt manual → "Promo {entidad}: {titulo}" (banco) → "{titulo} — {descripcion}".
 * Nunca devuelve "" cuando hay imagen: una imagen sin alt es un fallo de accesibilidad y SEO.
 */
export function resolvePromoAlt(promo: {
  tipo: string;
  titulo: string;
  descripcion?: string | null;
  entidad?: string | null;
  alt_texto?: string | null;
}): string {
  const manual = promo.alt_texto?.trim();
  if (manual) return manual;

  if (promo.tipo === "banco" && promo.entidad?.trim()) {
    return `Promo ${promo.entidad.trim()}: ${promo.titulo} en Beatmemo Rosario`;
  }

  const desc = promo.descripcion?.trim();
  return desc ? `${promo.titulo} — ${desc}` : `${promo.titulo} en Beatmemo Rosario`;
}

/**
 * ¿La promo aplica HOY? Combina activo + rango de fechas + días de semana.
 * Se evalúa en zona horaria Argentina (el día de la semana depende de la TZ).
 *
 * dias_semana es ISO 1=lun...7=dom. JS getDay() es 0=dom...6=sáb → se convierte.
 * NOTA: idealmente esto se filtra en la QUERY de Postgres (más eficiente y usa
 * la TZ del server). Este helper es el espejo para el admin/preview y para
 * validar en cliente sin round-trip. La query pública es la fuente de verdad.
 */
export function isPromoVigente(promo: PromoData, now: Date = new Date()): boolean {
  if (!promo.activo) return false;

  // Fecha "hoy" en Argentina (YYYY-MM-DD) para comparar con date columns.
  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "2026-07-20"

  if (promo.fecha_desde && hoyAr < promo.fecha_desde) return false;
  if (promo.fecha_hasta && hoyAr > promo.fecha_hasta) return false;

  if (promo.dias_semana && promo.dias_semana.length > 0) {
    // Día de semana ISO en Argentina.
    const diaAr = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      weekday: "short",
    }).format(now); // "Mon", "Tue"...
    const mapIso: Record<string, number> = {
      Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
    };
    const isoHoy = mapIso[diaAr];
    if (!promo.dias_semana.includes(isoHoy)) return false;
  }

  return true;
}

/**
 * ¿Esta promo se renderiza como card-imagen o card-CSS?
 * Decisión "A": la presencia de imagen manda, no el tipo.
 */
export function promoTieneImagen(promo: { imagen_url?: string | null }): boolean {
  return Boolean(promo.imagen_url?.trim());
}
/**
 * Texto de vencimiento para la card. Solo devuelve algo si la promo vence
 * dentro de los próximos 30 días (urgencia real). Sin fecha_hasta o vencimiento
 * más lejano → null → la card no muestra nada. Formato: "Hasta el 14/2".
 */
export function resolveVencimiento(
  promo: { fecha_hasta: string | null },
  now: Date = new Date()
): string | null {
  if (!promo.fecha_hasta) return null;

  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);

  const hasta = new Date(promo.fecha_hasta + "T00:00:00");
  const hoy = new Date(hoyAr + "T00:00:00");
  const diffDias = Math.ceil((hasta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias < 0 || diffDias > 30) return null;

  const [, mes, dia] = promo.fecha_hasta.split("-");
  return `Hasta el ${parseInt(dia, 10)}/${parseInt(mes, 10)}`;
}
// En promo-helpers.ts — reemplaza/agrega esta función
export type EstadoPromo = "vigente" | "programada" | "vencida" | "inactiva";

export function estadoPromo(promo: PromoData, now: Date = new Date()): EstadoPromo {
  if (!promo.activo) return "inactiva";

  const hoyAr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);

  // Vencida: tiene fecha_hasta y ya pasó.
  if (promo.fecha_hasta && hoyAr > promo.fecha_hasta) return "vencida";

  // Vigente hoy: pasa el filtro completo de vigencia.
  if (isPromoVigente(promo, now)) return "vigente";

  // Activa pero no aplica hoy (día distinto, o fecha_desde futura).
  return "programada";
}

// En promo-helpers.ts — agregá al final

// Texto de "cuándo vuelve" para una promo NO vigente hoy.
// Prioriza el día de la semana (caso banco); si es por fecha, la fecha de inicio.
export function proximaVigencia(promo: PromoData, now: Date = new Date()): string {
  const DIAS_FULL: Record<number, string> = {
    1: "lunes", 2: "martes", 3: "miércoles", 4: "jueves", 5: "viernes", 6: "sábados", 7: "domingos",
  };

  // Caso día de semana: "Vuelve los martes" / "Mar y Jue"
  if (promo.dias_semana && promo.dias_semana.length > 0) {
    const dias = [...promo.dias_semana].sort((a, b) => a - b);
    if (dias.length === 1) return `Vuelve los ${DIAS_FULL[dias[0]]}`;
    const abbr: Record<number, string> = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom" };
    return `Días ${dias.map((d) => abbr[d]).join(", ")}`;
  }

  // Caso fecha futura: "Desde el 14/2"
  if (promo.fecha_desde) {
    const hoyAr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).format(now);
    if (promo.fecha_desde > hoyAr) {
      const [, mes, dia] = promo.fecha_desde.split("-");
      return `Desde el ${parseInt(dia, 10)}/${parseInt(mes, 10)}`;
    }
  }

  return "Próximamente";
}