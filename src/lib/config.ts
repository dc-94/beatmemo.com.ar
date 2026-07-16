// src/lib/config.ts

/**
 * Datos de contacto del venue — FUENTE ÚNICA.
 *
 * Antes el número de WhatsApp estaba hardcodeado en al menos 4 lugares
 * (WhatsAppFAB, Footer, JSON-LD, FullAgendaWrapper) y con http:// en vez de
 * https:// en algunos. Si el bar cambia de número, ahora se toca UN archivo.
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
 * @param mensaje - texto opcional; se codifica entero (no a mano con %20).
 */
export function whatsappLink(mensaje?: string): string {
  if (!mensaje) return WHATSAPP_BASE;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(mensaje)}`;
}

/** URL pública del sitio (para metadata, links absolutos, JSON-LD). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://beatmemo.com.ar";

/** Link directo al formulario de reseña de Google. Universal https://. */
export const GOOGLE_REVIEW_URL = "https://g.page/r/CZ8oHnT2ZcQjEAE/review";