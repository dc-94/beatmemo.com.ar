import type { Metadata } from "next";
import { headers } from "next/headers";
import { Barlow, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import SplashLoader from "@/components/layout/SplashLoader";
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

// Corre ANTES del primer paint. Si el visitante ya vio el splash, marca el
// <html> y el CSS lo oculta sin parpadeo. Es lo que permite sacar cookies()
// del layout sin degradar la experiencia.
const SPLASH_SCRIPT = `try{if(document.cookie.indexOf('loader_visto=true')>-1){document.documentElement.dataset.splash='seen'}}catch(e){}`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  const adminPrefix = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN_PREFIX || "vault.";
  const qrPrefix = process.env.NEXT_PUBLIC_QR_SUBDOMAIN_PREFIX || "qr.";

  const isAdmin = host.startsWith(adminPrefix);
  const isQr = host.startsWith(qrPrefix);
  const chromeCompleto = !isAdmin && !isQr;

  return (
    <html
      lang="es"
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
      </head>
      <body
        className={`${barlow.variable} ${libreBaskerville.variable} font-sans bg-brand-black-100 text-brand-white-100 antialiased`}
      >
        {chromeCompleto && <SplashLoader />}
        {chromeCompleto && <Navbar />}

        <main className="flex-grow">{children}</main>

        {chromeCompleto && <Footer />}
        {chromeCompleto && <WhatsAppFAB />}
      </body>
    </html>
  );
}