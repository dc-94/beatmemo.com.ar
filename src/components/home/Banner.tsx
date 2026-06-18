// src/components/home/Banner.tsx
import Image from "next/image";

export default function Banner() {
  const badges = [
    {
      id: "sintacc",
      src: "/placeholders/sintacc.webp",
      alt: "Comercio con opciones Sin TACC",
    },
    {
      id: "petfriendly",
      src: "/placeholders/pet.png",
      alt: "Pet Friendly",
    },
    {
      id: "bikefriendly",
      src: "/placeholders/bike.png",
      alt: "Bike Friendly",
    },
    {
      id: "cultural",
      src: "/placeholders/cultura.png",
      alt: "Sitio Cultural - Municipalidad de Rosario",
    },
  ];

  return (
    <section className="w-full bg-brand-black-100 border-b border-brand-white-300/10 py-10 my-2 sm:py-1 z-20 relative">
      {/* Contenedor Flex: flex-wrap es la magia que lo apila en 2 líneas en móvil si no hay espacio */}
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-10 gap-y-6 sm:gap-10 lg:gap-32">
        {badges.map((badge) => (
          <div 
            key={badge.id} 
            className="flex items-center justify-center opacity-100 transition-all duration-300"
          >
            <Image
              src={badge.src}
              alt={badge.alt}
              width={160} // Valor base de referencia
              height={60} // Valor base de referencia
              // Forzamos el alto (h-10 mobile, h-12 desktop) y dejamos que el ancho se ajuste solo
              className="h-14 sm:h-17 w-auto object-contain drop-shadow-md"
            />
          </div>
        ))}
      </div>
    </section>
  );
}