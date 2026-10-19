// src/app/rooftop/page.tsx  (Server Component)
import { getSiteConfig, rooftopBannerVisible } from "@/lib/site-config";
import RooftopBanner from "@/components/rooftop/RooftopBanner";
import RooftopNav from "@/components/rooftop/RooftopNav";
import RooftopHero from "@/components/rooftop/RooftopHero";
import TiposEvento from "@/components/rooftop/TiposEvento";
import Servicios from "@/components/rooftop/Servicios";
import CotizaFooter from "@/components/rooftop/CotizaFooter";
import CotizaModal from "@/components/rooftop/CotizaModal";

export default async function RooftopPage() {
  const config = await getSiteConfig();
  const bannerOn = rooftopBannerVisible(config);
  return (
    <>
      {bannerOn && <RooftopBanner mensaje={config.rooftop_banner_mensaje!} link={config.rooftop_banner_link ?? undefined} />}
      <RooftopNav bannerOn={bannerOn} />
      <RooftopHero />
      <TiposEvento />
      <Servicios />
      <CotizaFooter />
      <CotizaModal />
    </>
  );
}