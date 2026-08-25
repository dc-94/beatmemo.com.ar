// src/lib/evento-tema.ts
// Traduce estilo_tema al tratamiento visual. La card vive en dos contextos:
// agenda (fondo oscuro) y cultural (fondo claro). Por eso cada tema tiene
// variante según la superficie donde se renderiza.

export type Superficie = "dark" | "light";

export interface TemaEvento {
  segmentos?: string[];      
  flagbarColor?: string;      
  ciclo: string;              
  fondo: string;              
  bordeModal: string;      
}

const UK_SEGMENTOS = ["#012169", "#ffffff", "#C8102E", "#ffffff", "#012169"];
const IT_SEGMENTOS = ["#008C45", "#ffffff", "#CD212A"];

export function getTema(estiloTema: string | null | undefined, superficie: Superficie = "dark"): TemaEvento {
  const dark = superficie === "dark";

  switch (estiloTema) {
    case "uk-flag":
      return {
        segmentos: UK_SEGMENTOS,
        // Sobre claro, el azul de la bandera; sobre oscuro, un celeste claro.
        ciclo: dark ? "text-[#9DB0DB]" : "text-[#012169]",
        fondo: dark ? "bg-[#161616]" : "bg-white",
        bordeModal: dark ? "border-t-[#9DB0DB]" : "border-t-[#012169]",
      };
    case "it-flag":
      return {
        segmentos: IT_SEGMENTOS,
        ciclo: dark ? "text-[#7CC4A0]" : "text-[#008C45]",
        fondo: dark ? "bg-[#161616]" : "bg-white",
        bordeModal: dark ? "border-t-[#7CC4A0]" : "border-t-[#008C45]",
      };
    case "coral":
      return {
        flagbarColor: "#E27D5F",
        ciclo: dark ? "text-[#E27D5F]" : "text-[#C25A3C]",  // más oscuro sobre claro
        fondo: dark ? "bg-[#161616]" : "bg-white",
        bordeModal: "border-t-[#E27D5F]",
      };
    case "red":
      return {
        flagbarColor: "#C41E34",
        ciclo: dark ? "text-[#E8536A]" : "text-[#C41E34]",
        fondo: dark ? "bg-[#141414]" : "bg-white",
        bordeModal: "border-t-[#C41E34]",
      };
    case "gold":
    default:
      return {
        flagbarColor: "#C5A059",
        ciclo: dark ? "text-[#C5A059]" : "text-[#8A6D2F]",  // dorado oscuro sobre claro
        fondo: dark ? "bg-[#141414]" : "bg-white",
        bordeModal: "border-t-[#C5A059]",
      };
  }
}