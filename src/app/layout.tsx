// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
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

// Marca "splash ya visto" antes de la hidratación, sin cookies() en server.
const SPLASH_SCRIPT = `try{if(document.cookie.indexOf('loader_visto=true')>-1){document.documentElement.dataset.splash='seen'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${barlow.variable} ${libreBaskerville.variable} font-sans bg-brand-black-100 text-brand-white-100 antialiased`}
      >
        <Script id="splash-seen" strategy="beforeInteractive">
          {SPLASH_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}