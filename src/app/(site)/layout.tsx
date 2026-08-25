// src/app/(site)/layout.tsx

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { getSiteConfig, bannerVisible } from "@/lib/site-config";
import AvisoBanner from "@/components/layout/AvisoBanner";
import SplashLoader from "@/components/layout/SplashLoader";
import { buildBeatmemoSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/config";
import SkipToContent from "@/components/layout/SkipToContent";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  const mostrarBanner = bannerVisible(config);
  const schema = buildBeatmemoSchema(config, SITE_URL);


  return (
    <>
    <SkipToContent />      
     <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
      
      <div className="sticky top-0 z-50">
        {mostrarBanner && <AvisoBanner mensaje={config.banner_mensaje!} />}
        <Navbar rooftopUrl={config.rooftop_url} />
      </div>
      <SplashLoader />
      <main id="contenido-principal" className="flex-grow">{children}</main>
      <Footer
        whatsappNumero={config.whatsapp_numero}
        instagramUrl={config.instagram_url}
        facebookUrl={config.facebook_url}
        googleReviewUrl={config.google_review_url}
        horarios={config.horarios}  
        rooftopUrl={config.rooftop_url}
      />
      <WhatsAppFAB whatsappNumero={config.whatsapp_numero} />
    </>
  );
}