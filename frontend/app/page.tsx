import { Header } from "@/components/Header";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { HowIThink } from "@/components/sections/HowIThink";
import { Measuring } from "@/components/sections/Measuring";
import { Toolbox } from "@/components/sections/Toolbox";
import { BeyondCode } from "@/components/sections/BeyondCode";
import { ChatSection } from "@/components/sections/ChatSection";
import { Footer } from "@/components/sections/Footer";
import { WavyDivider } from "@/components/primitives/WavyDivider";
import { EasterEggs } from "@/components/eggs/EasterEggs";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative z-10">
        <Hero />
        <SelectedWork />
        <WavyDivider color="honey" />
        <HowIThink />
        <WavyDivider color="fern" />
        <Measuring />
        <WavyDivider color="grape" />
        <Toolbox />
        <WavyDivider color="grape" />
        <BeyondCode />
        <WavyDivider color="cobalt" />
        <ChatSection />
        <WavyDivider color="berry" />
        <Footer />
      </main>
      <EasterEggs />
    </>
  );
}
