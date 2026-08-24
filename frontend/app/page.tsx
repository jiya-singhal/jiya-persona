import { Header } from "@/components/Header";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { HowIThink } from "@/components/sections/HowIThink";
import { Measuring } from "@/components/sections/Measuring";
import { Toolbox } from "@/components/sections/Toolbox";
import { BeyondCode } from "@/components/sections/BeyondCode";
import { ChatSection } from "@/components/sections/ChatSection";
import { Footer } from "@/components/sections/Footer";
import { MistDivider } from "@/components/primitives/MistDivider";
import { EasterEggs } from "@/components/eggs/EasterEggs";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative z-10">
        <Hero />
        <SelectedWork />
        <MistDivider />
        <HowIThink />
        <MistDivider flip />
        <Measuring />
        <MistDivider />
        <Toolbox />
        <MistDivider flip />
        <BeyondCode />
        <MistDivider />
        <ChatSection />
        <MistDivider flip />
        <Footer />
      </main>
      <EasterEggs />
    </>
  );
}
