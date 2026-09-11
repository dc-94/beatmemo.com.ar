// src/components/admin/ContenidoClient.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import ContenidoForm, { type SeccionData } from "./ContenidoForm";

interface MetaClave {
  clave: string;
  nombre: string;
  donde: string;  
  ruta: string;    
}

const GRUPOS: { grupo: string; claves: MetaClave[] }[] = [
  {
    grupo: "Home",
    claves: [
      { clave: "home_hero", nombre: "Portada (hero)", donde: "El título grande al entrar al sitio", ruta: "/" },
      { clave: "home_pub", nombre: "Bloque Pub", donde: "Sección crema con la foto y el texto del pub", ruta: "/#pub" },
      { clave: "home_museo", nombre: "Bloque Museo", donde: "Sección oscura del museo", ruta: "/#museo" },
      { clave: "home_espacio", nombre: "Bloque Espacio", donde: "Las 3 fotos del espacio con texto", ruta: "/" },
    ],
  },
  {
    grupo: "Pub",
    claves: [
      { clave: "pub", nombre: "Encabezado de la página", donde: "La foto grande al entrar a /pub", ruta: "/pub" },
      { clave: "pub_espacio", nombre: "Nuestro espacio", donde: "Galería de fotos del local", ruta: "/pub#espacio" },
      { clave: "pub_cafe", nombre: "Café", donde: "Sección de café y desayunos", ruta: "/pub#cafe" },
      { clave: "pub_ejecutivo", nombre: "Mediodía", donde: "Menú ejecutivo (banda oscura)", ruta: "/pub#ejecutivo" },
      { clave: "pub_cocina", nombre: "La cocina", donde: "Mosaico de platos principales", ruta: "/pub#cocina" },
      { clave: "pub_variedades", nombre: "Variedades (wraps)", donde: "Título de la fila de wraps", ruta: "/pub#cocina" },
      { clave: "pub_sello_1", nombre: "Sello 1", donde: "Franja de sellos bajo la cocina", ruta: "/pub#cocina" },
      { clave: "pub_sello_2", nombre: "Sello 2", donde: "Franja de sellos bajo la cocina", ruta: "/pub#cocina" },
      { clave: "pub_hh", nombre: "Happy Hour", donde: "Sección con foto y horario del happy hour", ruta: "/pub#happyhour" },
      { clave: "pub_barra", nombre: "Barra de autor", donde: "Sección de cócteles", ruta: "/pub#barra" },
      { clave: "pub_whisky", nombre: "Colección de whisky", donde: "Carrusel de logos de whisky", ruta: "/pub#whisky" },
    ],
  },
  {
    grupo: "Museo",
    claves: [
      { clave: "museo", nombre: "Encabezado de la página", donde: "La portada de /museo", ruta: "/museo" },
    ],
  },
  {
    grupo: "Agenda",
    claves: [
      { clave: "agenda", nombre: "Encabezado de la página", donde: "El título de la cartelera", ruta: "/agenda" },
    ],
  },
];

export default function ContenidoClient({ secciones }: { secciones: SeccionData[] }) {
  const [abierta, setAbierta] = useState<string | null>(null);

  // Index por clave para buscar rápido los datos que llegaron de la DB.
  const porClave = new Map(secciones.map((s) => [s.clave, s]));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-serif text-white">Contenido del Sitio</h1>
        <p className="text-neutral-400 text-sm">
          Editá los textos de cada sección. Los cambios se ven en el sitio al guardar.
        </p>
      </div>

      {GRUPOS.map(({ grupo, claves }) => {
        const disponibles = claves.filter((c) => porClave.has(c.clave));
        if (disponibles.length === 0) return null;

        return (
          <section key={grupo} className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 px-1">
              {grupo}
            </h2>

            <div className="space-y-2">
              {disponibles.map((meta) => {
                const sec = porClave.get(meta.clave)!;
                const expandida = abierta === meta.clave;

                return (
                  <div key={meta.clave} className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setAbierta(expandida ? null : meta.clave)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-neutral-900 hover:bg-neutral-800 transition text-left"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold text-white text-sm">{meta.nombre}</span>
                        <span className="block text-xs text-neutral-500 truncate">{meta.donde}</span>
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-neutral-400 shrink-0 transition-transform ${expandida ? "rotate-180" : ""}`}
                      />
                    </button>

                    {expandida && (
                      <div className="p-4 bg-neutral-950 border-t border-white/5 space-y-4">
                        
                        <a  href={meta.ruta}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          <ExternalLink size={13} /> Ver esta sección en el sitio
                        </a>
                        <ContenidoForm seccion={sec} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}