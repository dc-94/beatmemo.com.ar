// src/lib/config.ts

/**
 * Datos de contacto del venue — FUENTE ÚNICA.
 * Si el bar cambia de número, se toca UN archivo.
 */
export const CONTACT = {
  /** Formato internacional para tel: y JSON-LD */
  phoneIntl: "+5493412023737",
  /** Formato para wa.me (sin + ni espacios) */
  whatsappNumber: "5493412023737",
} as const;

/** Base de wa.me. HTTPS: http:// provoca un redirect innecesario. */
export const WHATSAPP_BASE = `https://wa.me/${CONTACT.whatsappNumber}`;

/**
 * Construye un link de WhatsApp con mensaje pre-cargado.
 * Codifica el mensaje ENTERO con encodeURIComponent.
 *
 * Los links viejos escribían %20 a mano pero dejaban comas, tildes y signos
 * sin codificar. Funcionaba de casualidad: el día que un título de show
 * trajera & o #, el mensaje se cortaba a la mitad.
 */
export function whatsappLink(mensaje?: string, numero?: string): string {
  const base = `https://wa.me/${numero || CONTACT.whatsappNumber}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Mensajes pre-cargados de WhatsApp — FUENTE ÚNICA.
 *
 * Antes vivían inline en 7+ componentes, con el texto de "visita guiada"
 * DUPLICADO entre museo/page.tsx y MuseumPreview.tsx. Cambiar el tono de
 * los mensajes implicaba una cacería por el repo.
 *
 * Los estáticos son strings; los que dependen de datos son funciones.
 */
export const WA_MESSAGES = {
  reservaMesa: "Hola! Quiero reservar una mesa en Beatmemo.",
  visitaGuiada: "Hola, quisiera consultar disponibilidad y precios para una guia privada al museo.",
  consultaShows: "Hola! Quiero consultar por los próximos shows de Beatmemo.",
  cartaNoCarga: "Hola! No me carga la carta digital, ¿me la pasan?",

  /**
   * "Hola, quisiera reservar una mesa para Noche de Jazz el viernes 18 de julio"
   *
   * OJO con el T12:00:00 — no es capricho. `new Date("2026-07-18")` se
   * interpreta como medianoche UTC, que en Argentina (UTC-3) es el día
   * ANTERIOR a las 21hs: el mensaje diría "el jueves 17". Anclando al
   * mediodía, cualquier offset razonable cae en el día correcto.
   */
  reservaShow: (titulo: string, fecha?: string) => {
    if (!fecha) return `Hola, quisiera reservar una mesa para ${titulo}`;
    const d = new Date(`${fecha}T12:00:00`);
    if (isNaN(d.getTime())) return `Hola, quisiera reservar una mesa para ${titulo}`;
    const fechaStr = d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return `Hola, quisiera reservar una mesa para ${titulo} el ${fechaStr}`;
  },
  
  anotarseCiclo: (nombre: string) => `Hola, quiero anotarme para ${nombre}`,
} as const;

/** URL pública del sitio (para metadata, links absolutos, JSON-LD). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://beatmemo.com.ar";

/** Link directo al formulario de reseña de Google. Universal https://. */
export const GOOGLE_REVIEW_URL = "https://g.page/r/CZ8oHnT2ZcQjEAE/review";


export const SOCIAL = {
  instagram: "https://instagram.com/beatmemo_rosario",
  facebook: "https://www.facebook.com/beatmemopub",
} as const;

export const LEGAL = {
  razonSocial: "BEATMEMO S.R.L.",
  cuit: "30-71883910-2",
  nombreFantasia: "Beatmemo",
  ciudad: "Rosario, Santa Fe, Argentina",
  ultimaActualizacion: "22 de enero de 2026",
} as const;

/**
 * Calendly — visitas guiadas para instituciones educativas.
 * DOS tipos de evento separados (español / inglés): un solo calendario con
 * selector produjo reservas en el idioma equivocado.
 * Los parámetros de color integran el widget a la paleta oscura del sitio.
 */
const CALENDLY_PARAMS =
  "hide_gdpr_banner=1&background_color=111111&text_color=e8e6e1&primary_color=c5a059";

export const CALENDLY_VISITAS = {
  es: {
    label: "Español",
    ayuda: "La visita se dicta en español",
    url: `https://calendly.com/beatmemopub/visitas-guiadas-espanol?${CALENDLY_PARAMS}`,
  },
  en: {
    label: "English",
    ayuda: "The tour is conducted in English",
    url: `https://calendly.com/beatmemopub/visitas-guiadas-ingles?${CALENDLY_PARAMS}`,
  },
} as const;