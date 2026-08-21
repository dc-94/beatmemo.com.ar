// src/app/(site)/layout.tsx
// Layout del SITIO PÚBLICO: agrega el chrome (navbar, footer, splash, FAB).
// Todo lo que está bajo (site)/ lo hereda. El QR y el admin NO están acá,
// así que no lo reciben — la estructura reemplaza la condición con headers().
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { getSiteConfig, bannerVisible } from "@/lib/site-config";
import AvisoBanner from "@/components/layout/AvisoBanner";
import SplashLoader from "@/components/layout/SplashLoader";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  const mostrarBanner = bannerVisible(config);

  return (
    <>
      <div className="sticky top-0 z-50">
        {mostrarBanner && <AvisoBanner mensaje={config.banner_mensaje!} />}
        <Navbar />
      </div>
      <SplashLoader />
      <main className="flex-grow">{children}</main>
      <Footer
        whatsappNumero={config.whatsapp_numero}
        instagramUrl={config.instagram_url}
        facebookUrl={config.facebook_url}
        googleReviewUrl={config.google_review_url}
        horarios={config.horarios}  
      />
      <WhatsAppFAB whatsappNumero={config.whatsapp_numero} />
    </>
  );
}