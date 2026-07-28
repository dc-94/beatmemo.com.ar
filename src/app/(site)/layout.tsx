// src/app/(site)/layout.tsx
// Layout del SITIO PÚBLICO: agrega el chrome (navbar, footer, splash, FAB).
// Todo lo que está bajo (site)/ lo hereda. El QR y el admin NO están acá,
// así que no lo reciben — la estructura reemplaza la condición con headers().
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import SplashLoader from "@/components/layout/SplashLoader";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SplashLoader />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}