import type { Metadata } from "next"; 
import { headers } from "next/headers";
import {cookies} from "next/headers";
import { Barlow, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer"; 
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import SplashLoader from "@/components/layout/SplashLoader";

// Configuración de Barlow (Sans-serif)
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

// Configuración de Libre Baskerville (Serif)
const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Beatmemo | Museo y Pub Temático en Rosario",
    template: "%s | Beatmemo", // Esto hace que el título se auto-complete
  },
  description: "El punto de encuentro de los fans de The Beatles en Rosario.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Detectamos el Host desde el servidor antes de renderizar nada
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const adminPrefix = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN_PREFIX || 'vault.';
  
  // 2. Variable booleana: ¿Estamos en el admin?
  const isAdmin = host.startsWith(adminPrefix);
  
  const cookieStore = await cookies();
  const hasSeenLoader = cookieStore.get("loader_visto")?.value === "true";

  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${barlow.variable} ${libreBaskerville.variable} font-sans bg-brand-black-100 text-brand-white-100 antialiased`}>
        
        {/* Renderizado Condicional: Solo se muestra si NO estamos en el admin */}
        {!isAdmin && <SplashLoader hasSeenLoader={hasSeenLoader} />}
        {!isAdmin && <Navbar />}
        
        <main className="flex-grow">{children}</main>
        
        {/* Renderizado Condicional: Solo se muestra si NO estamos en el admin */}
        {!isAdmin && <Footer />}
        {!isAdmin && <WhatsAppFAB />}
        
      </body>
    </html>
  );
}