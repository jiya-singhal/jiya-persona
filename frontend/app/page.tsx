import { Header } from "@/components/Header";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Projects } from "@/components/sections/Projects";
import { Notes } from "@/components/sections/Notes";
import { About } from "@/components/sections/About";
import { ChatSection } from "@/components/sections/ChatSection";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Work />
        <ChatSection />
        <Projects />
        <Notes />
        <About />
        <Footer />
      </main>
    </>
  );
}
