// src/lib/rooftop-data.ts
//
// Contenido del landing de Rooftop — FUENTE ÚNICA (primera instancia, SIN CRUD).
// Cuando se mueva a DB (deuda: Fase 4), estas mismas formas son el "shape" de
// la tabla, así el componente no cambia: solo cambia de dónde salen los datos.
//
// Las fotos reutilizan los placeholders que ya viven en /public/placeholders/rooftop.
// Reemplazá los paths por las fotos reales del rooftop cuando las tengas.

/** Número de WhatsApp del Rooftop en formato wa.me (sin + ni espacios).
 *  TODO CONFIRMAR: el dossier dice "341 6 530 839". Si el rooftop usa el
 *  mismo número del pub, borrá esta constante y usá CONTACT.whatsappNumber. */
export const ROOFTOP_WHATSAPP = "5493416530839";

/** Datos de contacto propios del rooftop (distintos a los del pub). */
export const ROOFTOP_CONTACT = {
  direccion: "Bv. Oroño 111 Bis",
  ciudad: "Rosario",
  instagram: "@rooftopbeatmemo",
  instagramUrl: "https://instagram.com/rooftopbeatmemo",
  telefono: "341 6 530 839",
  email: "beatmemorooftop@gmail.com",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bv.+Oro%C3%B1o+111+Bis+Rosario",
} as const;
 
/** Capacidad del salón. */
export const ROOFTOP_CAPACIDAD = {
  sentadas: 50,
  lunch: 80,
} as const;

export interface TipoEvento {
  id: string;
  num: string;
  /** Título en dos pesos: `strong` va en 800, `light` en 300.
   *  Se renderizan pegados (sin separador), así que si el corte es entre
   *  palabras, el espacio va al inicio de `light` (ej: " de 15"). */
  titulo: { strong: string; light: string };
  descripcion: string;
  /** 2-4 fotos a color para el carrusel de este tipo. */
  imagenes: string[];
}

/** Tipos de evento — orden = orden en pantalla (Z-pattern alterna solo). */
export const TIPOS_EVENTO: TipoEvento[] = [
  {
    id: "casamientos",
    num: "01",
    titulo: { strong: "Casa", light: "mientos" },
    descripcion: "Un espacio íntimo y cálido para compartir con quienes más querés.",
    imagenes: [
      "/placeholders/rooftop/1.jpeg",
      "/placeholders/rooftop/2.jpeg",
      "/placeholders/rooftop/3.jpeg",
    ],
  },
  {
    id: "cumpleanos-15",
    num: "02",
    titulo: { strong: "Cumpleaños", light: " de 15" },
    descripcion:
      "Una noche única merece un lugar especial. El escenario perfecto para un momento inolvidable.",
    imagenes: [
      "/placeholders/rooftop/4.jpeg",
      "/placeholders/rooftop/5.jpeg",
      "/placeholders/rooftop/6.jpeg",
    ],
  },
  {
    id: "corporativos",
    num: "03",
    titulo: { strong: "Corpo", light: "rativos" },
    descripcion:
      "Lanzamientos, after office y reuniones con identidad propia y servicio completo.",
    imagenes: [
      "/placeholders/rooftop/3.jpeg",
      "/placeholders/rooftop/1.jpeg",
      "/placeholders/rooftop/5.jpeg",
    ],
  },
  {
    id: "cata-vinos",
    num: "04",
    titulo: { strong: "Cata", light: " de vinos" },
    descripcion:
      "Degustaciones y experiencias gastronómicas en un marco con historia propia.",
    imagenes: [
      "/placeholders/rooftop/2.jpeg",
      "/placeholders/rooftop/6.jpeg",
      "/placeholders/rooftop/4.jpeg",
    ],
  },
  {
    id: "shows",
    num: "05",
    titulo: { strong: "Shows", light: " en vivo" },
    descripcion:
      "Música en vivo y espectáculos con el sello Beatmemo sobre la terraza.",
    imagenes: [
      "/placeholders/rooftop/5.jpeg",
      "/placeholders/rooftop/3.jpeg",
      "/placeholders/rooftop/1.jpeg",
    ],
  },
];

export interface Servicio {
  texto: string;
  detalle?: string;
}

/** Qué incluye el servicio (sección "Servicios"). */
export const SERVICIOS: Servicio[] = [
  { texto: "Salón exclusivo", detalle: "uso privado para tu evento" },
  { texto: "Iluminación de ambientación" },
  { texto: "Música ambientada", detalle: "Spotify o DJ propio" },
  { texto: "Micrófonos y altavoces" },
  { texto: "Barra + bartender", detalle: "coctelería en cristalería" },
  { texto: "Personal de servicio" },
  { texto: "Terraza con living" },
  { texto: "Proyector + pantalla" },
  { texto: "Baños exclusivos" },
  { texto: "Gastronomía Beatmemo", detalle: "desayuno a cena o finger food" },
];

/** Fotos del hero (a color). */
export const HERO_IMAGENES = [
  "/placeholders/rooftop/1.jpeg",
  "/placeholders/rooftop/3.jpeg",
  "/placeholders/rooftop/5.jpeg",
];

/** Foto en B&N para la sección Servicios. */
export const SERVICIOS_IMAGEN = "/placeholders/rooftop/2.jpeg";

/** Opciones del <select> de tipo de evento en el form de cotización. */
export const OPCIONES_COTIZACION = [
  "Casamiento",
  "Cumpleaños de 15",
  "Cumpleaños",
  "Evento corporativo",
  "Cata de vinos",
  "Show en vivo",
  "Otro",
] as const;
