
import type { SiteConfig } from "@/lib/site-config";

const HORARIOS_SCHEMA = [
  { dias: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "08:30", closes: "00:30" },
  { dias: ["Friday"], opens: "08:30", closes: "02:00" },
  { dias: ["Saturday"], opens: "09:00", closes: "02:00" },
  { dias: ["Sunday"], opens: "09:00", closes: "01:00" },
];

export function buildBeatmemoSchema(config: SiteConfig, siteUrl: string) {
  const sameAs = [config.instagram_url, config.facebook_url].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["BarOrPub", "TouristAttraction"],
    "@id": `${siteUrl}/#business`,
    name: "Beatmemo",
    description:
      "Pub y museo temático de The Beatles en Rosario. Cocina de autor, hamburguesas, pizzas, cócteles de autor y espacio cultural.",
    url: siteUrl,
    telephone: config.telefono_intl || undefined,
    servesCuisine: ["Pub food", "Hamburguesas", "Pizza", "Cócteles de autor", "Cocina sin TACC", "Vegetariana"],
    priceRange: "$$",
    acceptsReservations: "True",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bv. Oroño 107 bis",
      addressLocality: "Rosario",
      addressRegion: "Santa Fe",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -32.935105,
      longitude: -60.655938,
    },
    image: `${siteUrl}/og/home.jpg`,
    menu: `${siteUrl}/menu`,
    openingHoursSpecification: HORARIOS_SCHEMA.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dias,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: sameAs.length ? sameAs : undefined,
    amenityFeature: {
      "@type": "LocationFeatureSpecification",
      name: "Mesas al aire libre",
      value: true,
    },
  };
}

// Schema propio de la página del Rooftop (no hereda el schema de Beatmemo).
//  EventVenue + LocalBusiness: espacio de eventos.
export function buildRooftopSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["EventVenue", "LocalBusiness"],
    "@id": `${siteUrl}/rooftop/#venue`,
    name: "Beatmemo Rooftop",
    description:
      "Espacio para eventos en la terraza de Beatmemo, Rosario: casamientos, cumpleaños de 15, eventos corporativos, catas y shows. Servicio llave en mano.",
    url: `${siteUrl}/rooftop`,
    telephone: "+543416530839",
    image: `${siteUrl}/og/home.jpg`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bv. Oroño 111 bis",
      addressLocality: "Rosario",
      addressRegion: "Santa Fe",
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: -32.935105, longitude: -60.655938 },
    maximumAttendeeCapacity: 80,
    areaServed: { "@type": "City", name: "Rosario" },
    isPartOf: { "@id": `${siteUrl}/#business` },
    sameAs: ["https://instagram.com/rooftopbeatmemo"],
  };
}