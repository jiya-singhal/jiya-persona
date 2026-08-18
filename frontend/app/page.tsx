import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Activity } from "@/components/sections/Activity";
import { ChatSection } from "@/components/sections/ChatSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Activity />
      <ChatSection />
      <Footer />
    </main>
  );
}
