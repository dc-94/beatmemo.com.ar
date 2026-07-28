// src/app/layout.tsx
// Root layout MÍNIMO. Sin chrome, sin headers(), sin cookies() → sin APIs
// dinámicas → las páginas pueden ser estáticas/ISR. El chrome vive en
// (site)/layout.tsx; el QR en (bare); el admin en su propio grupo.
import type { Metadata } from "next";
import { Barlow, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  title: {
    default: "Beatmemo | Museo y Pub Temático en Rosario",
    template: "%s | Beatmemo",
  },
  description: "El punto de encuentro de los fans de The Beatles en Rosario.",
};

// Oculta el splash antes del paint para quien ya lo vio (sin cookies() en el
// servidor). El componente SplashLoader vive ahora en (site)/layout.tsx.
const SPLASH_SCRIPT = `try{if(document.cookie.indexOf('loader_visto=true')>-1){document.documentElement.dataset.splash='seen'}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
      </head>
      <body
        className={`${barlow.variable} ${libreBaskerville.variable} font-sans bg-brand-black-100 text-brand-white-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}