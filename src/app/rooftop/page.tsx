// src/app/rooftop/page.tsx  (Server Component)
import { getSiteConfig, rooftopBannerVisible } from "@/lib/site-config";
import RooftopBanner from "@/components/rooftop/RooftopBanner";
import RooftopNav from "@/components/rooftop/RooftopNav";
import RooftopHeroWrapper from "@/components/rooftop/RooftopHeroWrapper";
import TiposEventoWrapper from "@/components/rooftop/TiposEventoWrapper";
import Servicios from "@/components/rooftop/Servicios";
import Cotizador from "@/components/rooftop/Cotizador";
import RooftopFooter from "@/components/rooftop/RooftopFooter";
import CotizaModal from "@/components/rooftop/CotizaModal";
import Descubri from "@/components/rooftop/Descubri";

export default async function RooftopPage() {
  const config = await getSiteConfig();
  const bannerOn = rooftopBannerVisible(config);
  return (
    <>
      {bannerOn && <RooftopBanner mensaje={config.rooftop_banner_mensaje!} link={config.rooftop_banner_link ?? undefined} />}
      <RooftopNav bannerOn={bannerOn} />
      <RooftopHeroWrapper />
      <TiposEventoWrapper />
      <Servicios />
      <Descubri />
      <Cotizador />
      <RooftopFooter />
      <CotizaModal />
    </>
  );
}