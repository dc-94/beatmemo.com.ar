import type { Metadata } from "next";
import { Barlow, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer"; // <-- 1. Importa esto
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";

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
  title: "Beatmemo 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${barlow.variable} ${libreBaskerville.variable} font-sans bg-brand-black-100 text-brand-white-100 antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer /> 
        <WhatsAppFAB />
      </body>
    </html>
  );
}