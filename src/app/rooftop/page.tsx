// src/app/rooftop/page.tsx 

import RooftopNav from "@/components/rooftop/RooftopNav";
import RooftopHero from "@/components/rooftop/RooftopHero";
import TiposEvento from "@/components/rooftop/TiposEvento";
import Servicios from "@/components/rooftop/Servicios";
import CotizaFooter from "@/components/rooftop/CotizaFooter";
import CotizaModal from "@/components/rooftop/CotizaModal";
export default function RooftopPage() {
  return (
    <>
      <RooftopNav />
      <RooftopHero />
      <TiposEvento />
      <Servicios />
      <CotizaFooter />
      <CotizaModal />
    </>
  );
}
 