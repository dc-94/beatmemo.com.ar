// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Estructura de navegación jerárquica
const navLinks = [
  { label: "Agenda", href: "/agenda" },
  {
    label: "Pub",
    href: "/pub",
    subLinks: [
      { label: "Nuestro espacio", href: "/pub#espacio" },
      { label: "Nuestra cocina", href: "/pub#cocina" },
      { label: "Nuestra barra", href: "/pub#barra" },
      { label: "Reservá tu mesa", href: "/reservas", badge: "Nuevo" },
    ],
  },
  {
    label: "Museo",
    href: "/museo",
    subLinks: [
      { label: "Recorré el museo", href: "/museo" },
      { label: "Visitas guiadas", href: "/museo/visitas-guiadas" },
    ],
  },
  { label: "Nosotros", href: "/nosotros" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Estado para controlar qué acordeones están abiertos en Mobile (Pub abierto por defecto)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    Pub: true, 
    Museo: false,
  });
  
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (pathname.startsWith("/admin")) return null;

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const toggleAccordion = (label: string) => {
    setOpenAccordions(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#1A1A1A] border-b border-brand-black-300">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm">
            <Image
              src="/brand/logo_BLANCO.svg"
              alt="Beatmemo Logo"
              width={180}
              height={32}
              priority
              className="h-6 md:h-8 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const hasSubLinks = !!link.subLinks;

              return (
                <div key={link.label} className="relative group">
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 font-sans text-sm font-bold tracking-widest uppercase transition-colors duration-200 py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm px-1 
                      ${isActive ? "text-brand-gold" : "text-brand-white-100 hover:text-brand-gold"}`}
                  >
                    {isActive ? `· ${link.label} ·` : link.label}
                    {hasSubLinks && (
                       <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                    )}
                  </Link>

                  {/* Dropdown CSS-only */}
                  {hasSubLinks && (
                    <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-[#1A1A1A] border border-brand-black-300 min-w-[200px] shadow-xl py-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                      {link.subLinks?.map((subLink) => (
                        <Link
                          key={subLink.label}
                          href={subLink.href}
                          className="flex items-center justify-between px-4 py-3 font-sans text-xs font-bold uppercase tracking-widest text-brand-white-200 hover:bg-brand-black-300 hover:text-brand-gold transition-colors"
                        >
                          {subLink.label}
                          {subLink.badge && (
                            <span className="bg-brand-gold text-brand-black-100 px-1.5 py-0.5 text-[9px] rounded-sm ml-2">
                              {subLink.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* ROOFTOP Logo */}
            <a href="#" target="_blank" rel="noopener noreferrer" className="ml-4 px-3 py-1.5 rounded-sm flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
              <span className="block w-20 h-4 bg-brand-white-100" style={{ WebkitMaskImage: "url('/brand/logo_ROOFTOP.svg')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: "url('/brand/logo_ROOFTOP.svg')" }} />
            </a>

            {/* VER CARTA Button */}
            <Link href="#" className="bg-brand-gold text-brand-black-100 px-6 py-2 rounded-sm font-sans font-bold uppercase tracking-wider hover:bg-accent-gold-vibrant transition-colors ml-4 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              VER CARTA
            </Link>
          </nav>

          {/* ================= MOBILE MENU TOGGLE ================= */}
          <button className="lg:hidden text-brand-white-100 p-2 hover:text-brand-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm" onClick={toggleMenu} aria-expanded={isMobileMenuOpen}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1A1A1A] flex flex-col px-6 py-8 h-screen w-full overflow-y-auto">
          <div className="flex justify-end w-full mb-8">
            <button onClick={toggleMenu} className="flex items-center text-brand-white-200 hover:text-brand-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm p-1">
              <span className="font-sans text-sm mr-2 font-bold tracking-widest uppercase">Cerrar</span>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center mb-10">
             <Image src="/brand/logo_BLANCO.svg" alt="Beatmemo Logo" width={150} height={28} className="h-6 w-auto opacity-50" />
          </div>

          <nav className="flex flex-col w-full max-w-sm mx-auto">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const hasSubLinks = !!link.subLinks;
              const isAccordionOpen = openAccordions[link.label];

              return (
                <div key={link.label} className={`border-b transition-colors duration-200 ${isActive ? "border-brand-gold/50" : "border-brand-white-300/30"}`}>
                  <div className="flex items-center justify-between py-4">
                    <Link
                      href={link.href}
                      onClick={() => !hasSubLinks && setIsMobileMenuOpen(false)}
                      className={`font-serif text-2xl tracking-wide block flex-grow transition-colors ${isActive ? "text-brand-gold italic font-bold" : "text-brand-white-100 font-bold hover:text-brand-gold"}`}
                    >
                      {link.label}
                    </Link>
                    
                    {hasSubLinks && (
                      <button 
                        onClick={() => toggleAccordion(link.label)}
                        className="p-2 text-brand-white-200 hover:text-brand-gold transition-colors flex items-center gap-2"
                      >
                        <span className="text-[10px] uppercase font-sans tracking-widest">Ver opciones</span>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${isAccordionOpen ? "rotate-180 text-brand-gold" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Sub-links (Accordion Body) */}
                  {hasSubLinks && (
                    <div className={`overflow-hidden transition-all duration-300 ${isAccordionOpen ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="flex flex-col pl-4 gap-4 border-l border-brand-white-300/20 ml-2 mt-2">
                        {link.subLinks?.map((subLink) => (
                          <Link
                            key={subLink.label}
                            href={subLink.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between text-brand-white-200 font-sans text-sm tracking-wide hover:text-brand-gold"
                          >
                            {subLink.label}
                            {subLink.badge && (
                              <span className="bg-brand-white-100 text-brand-black-100 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm">
                                {subLink.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="mt-12 flex flex-col items-center gap-6 pb-20">
              <a href="#" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="px-8 py-3 rounded-sm flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                <span className="block w-24 h-5 bg-brand-white-100" style={{ WebkitMaskImage: "url('/brand/logo_ROOFTOP.svg')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} />
              </a>

              <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="bg-brand-gold text-brand-black-100 px-8 py-3 rounded-sm font-sans font-bold uppercase tracking-wider w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                VER CARTA
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}