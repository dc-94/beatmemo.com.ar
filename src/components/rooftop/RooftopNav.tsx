import Link from "next/link";
import Image from "next/image";
import RooftopWordmark from "./RooftopWordmark";

/**
 * Nav propio del Rooftop. El gradiente sutil va EN EL PROPIO NAV (sin elemento
 * extra): fondo con feather del borde superior + ::after que proyecta un fade
 * blanco→transparente hacia el hero → transición armónica sin corte brusco.
 */
export default function RooftopNav({ bannerOn = false }: { bannerOn?: boolean }) {
  return (
    <nav className={`rt-nav fixed ${bannerOn ? "top-10" : "top-0"} inset-x-0 z-50 h-[68px] flex bg-white items-center justify-between px-5 sm:px-8 lg:px-10`}>
      <style>{`
        .rt-nav{background: hsl(0, 0%, 98%))}
        .rt-nav::after{content:"";position:absolute;left:0;right:0;top:100%;height:10px;pointer-events:none;background:linear-gradient(to bottom,rgba(250,250,250,.92),rgba(255,255,255,0))}
      `}</style>

      <Link href="#top" className="text-[#141211] shrink-0" aria-label="Beatmemo Rooftop">
        <RooftopWordmark className="w-[102px]" />
      </Link>

      <div className="hidden min-[880px]:flex gap-7">
        <a href="#tipos" className="text-[0.76rem] font-medium tracking-[0.08em] uppercase text-[#6d685f] hover:text-[#141211] transition">Tipos de evento</a>
        <a href="#servicios" className="text-[0.76rem] font-medium tracking-[0.08em] uppercase text-[#6d685f] hover:text-[#141211] transition">Servicios</a>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/" aria-label="Ir a Beatmemo" className="hidden min-[560px]:flex items-center shrink-0 hover:opacity-70 transition-opacity">
          <Image src="/brand/logo_NEGRO.svg" alt="Beatmemo" width={180} height={32} className="h-[18px] w-auto" />
        </Link>
        <a href="#cotizar" className="bg-[#141211] text-white font-bold tracking-[0.14em] uppercase px-4 sm:px-5 py-2.5 text-[0.72rem] hover:bg-black transition">
          <span className="hidden sm:inline">Cotizá tu evento</span>
          <span className="sm:hidden">Cotizá</span>
        </a>
      </div>
    </nav>
  );
}