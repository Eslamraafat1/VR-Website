import Intro from "@/components/home/intro";
import Hero from "@/components/home/hero";
import Marquee from "@/components/fx/marquee";
import { ClosingSection, ExperiencesSection, ExploreSection, HowItWorks, OffersSection, StoresSection } from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Intro />
      <Hero />
      <Marquee />
      <ExploreSection />
      <StoresSection />
      <ExperiencesSection />
      <OffersSection />
      <HowItWorks />
      <ClosingSection />
    </>
  );
}
