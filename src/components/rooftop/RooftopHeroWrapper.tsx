import { getHeroPublico } from "@/lib/rooftop-hero";
import RooftopHero from "./RooftopHero";

export default async function RooftopHeroWrapper() {
  const hero = await getHeroPublico();
  return <RooftopHero hero={hero} />;
}