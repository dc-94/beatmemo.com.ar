
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
    "@type": "BarOrPub",
    additionalType: "https://schema.org/TouristAttraction",
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