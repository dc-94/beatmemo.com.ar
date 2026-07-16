import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookies } from "next/headers";
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

  // El cliente que escanea el QR está sentado en la mesa: quiere la carta en
  // 2 segundos, no explorar el sitio. Nada de navbar, footer ni splash —
  // todo eso lo invita a irse justo cuando iba a pedir.
  // WhatsApp SÍ se queda: desde la mesa, "reservá tu mesa" no molesta y sirve.
  const chromeCompleto = !isAdmin && !isQr;

  const cookieStore = await cookies();
  const hasSeenLoader = cookieStore.get("loader_visto")?.value === "true";

  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${barlow.variable} ${libreBaskerville.variable} font-sans bg-brand-black-100 text-brand-white-100 antialiased`}
      >
        {chromeCompleto && <SplashLoader hasSeenLoader={hasSeenLoader} />}
        {chromeCompleto && <Navbar />}

        <main className="flex-grow">{children}</main>

        {chromeCompleto && <Footer />}
        {!isAdmin && <WhatsAppFAB />}
      </body>
    </html>
  );
}