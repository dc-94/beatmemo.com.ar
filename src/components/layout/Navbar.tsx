// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const pathname = usePathname();
  // Si estamos en cualquier ruta de admin, devolvemos null (no renderiza nada)
  if (pathname.startsWith("/admin")) return null;
  // Rutas Desktop
  const desktopLinks = [
    { label: "Shows", href: "/shows" },
    { label: "Pub", href: "/pub" },
    { label: "Museo", href: "/museo" },
    { label: "Visitas Guiadas", href: "/visitas-guiadas" },
    { label: "Cultura", href: "/cultura" },
  ];

  // Rutas Mobile
  const mobileLinks = [
    { label: "Shows", href: "/shows" },
    { label: "Pub", href: "/pub" },
    { label: "Museo", href: "/museo" },
    { label: "Visitas Guiadas", href: "/visitas-guiadas" },
    { label: "Cultura", href: "/cultura" },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#1A1A1A] border-b border-brand-black-300">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo Principal BEATMEMO */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/brand/logo_BLANCO.svg"
              alt="Beatmemo Logo"
              width={180}
              height={32}
              priority
              className="h-6 md:h-8 h-auto hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {desktopLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-sans text-sm font-bold tracking-widest uppercase transition-colors duration-200 
                    ${isActive ? "text-brand-gold" : "text-brand-white-100 hover:text-brand-gold"}`}
                >
                  {isActive ? `· ${link.label} ·` : link.label}
                </Link>
              );
            })}
            
            {/* ROOFTOP Logo (Enlace externo, sin hover de color) */}
            <a 
              href="#" // TODO: Reemplazar con la URL real del Rooftop
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 px-3 py-1.5 rounded-sm flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
              aria-label="Ir a Rooftop"
            >
              <span 
                className="block w-20 h-4 bg-brand-white-100"
                style={{
                  WebkitMaskImage: "url('/brand/logo_ROOFTOP.svg')",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: "url('/brand/logo_ROOFTOP.svg')",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
            </a>

            {/* RESERVAS Button */}
            <Link 
              href="/reservas" 
              className="bg-brand-gold text-brand-black-100 px-6 py-2 rounded-sm font-sans font-bold uppercase tracking-wider hover:bg-accent-gold-vibrant transition-colors ml-4 shadow-sm"
            >
              Reservas
            </Link>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="lg:hidden text-brand-white-100 p-2 hover:text-brand-gold transition-colors"
            onClick={toggleMenu}
            aria-label="Abrir menú"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1A1A1A] flex flex-col px-6 py-8 h-screen w-full overflow-y-auto">
          
          <div className="flex justify-end w-full mb-8">
            <button onClick={toggleMenu} className="flex items-center text-brand-white-200 hover:text-brand-gold transition-colors">
              <span className="font-sans text-sm mr-2 font-bold tracking-widest uppercase">Cerrar</span>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center mb-10">
             <Image
                src="/brand/logo_BLANCO.svg"
                alt="Beatmemo Logo"
                width={150}
                height={28}
                className="h-6 w-auto opacity-50"
              />
          </div>

          <nav className="flex flex-col w-full max-w-sm mx-auto">
            {mobileLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-4 text-center border-b transition-all duration-200
                    ${isActive ? "border-brand-gold" : "border-brand-white-300/30"}`}
                >
                  <span className={`font-serif text-2xl tracking-wide block transition-colors
                    ${isActive ? "text-brand-gold italic font-bold" : "text-brand-white-100 font-bold hover:text-brand-gold"}`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
            
            {/* Mobile ROOFTOP & Reservas */}
            <div className="mt-12 flex flex-col items-center gap-6">
              <a 
                href="#" // TODO: Reemplazar con la URL real del Rooftop
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-8 py-3 rounded-sm flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
              >
                <span 
                  className="block w-24 h-5 bg-brand-white-100"
                  style={{
                    WebkitMaskImage: "url('/brand/logo_ROOFTOP.svg')",
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                  }}
                />
              </a>

              <Link 
                href="/reservas" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-brand-gold text-brand-black-100 px-8 py-3 rounded-sm font-sans font-bold uppercase tracking-wider w-full text-center"
              >
                Reservas
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}