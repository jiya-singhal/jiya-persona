"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { COPY, HERO_STATS } from "@/content/profile";
import { EASE } from "@/lib/motion";
import { Waveform } from "@/components/primitives/Waveform";
import { Constellation } from "@/components/primitives/Constellation";
import { MoonGlow } from "@/components/primitives/MoonGlow";
import { Doodle } from "@/components/primitives/Doodle";
import { Highlight } from "@/components/primitives/Highlight";
import { Sticker } from "@/components/primitives/Sticker";
import { DotBurst } from "@/components/eggs/DotBurst";

/* Stat cards cycle through the pastels and alternate their tilt. */
const STAT_STYLE = [
  { bg: "bg-blush", tilt: "-rotate-2" },
  { bg: "bg-butter", tilt: "rotate-1" },
  { bg: "bg-mint", tilt: "-rotate-1" },
  { bg: "bg-sky", tilt: "rotate-2" },
  { bg: "bg-lilac", tilt: "-rotate-1" },
];

/** Puts a marker highlight behind the word "why" in the headline. */
function headline(text: string) {
  const i = text.indexOf("why");
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <Highlight color="butter">why</Highlight>
      {text.slice(i + 3)}
    </>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <MoonGlow className="absolute inset-0" />
      <Constellation className="pointer-events-none absolute -right-24 top-40 hidden w-[34rem] opacity-70 lg:block" />

      {/* doodles scattered in the margins */}
      <Doodle shape="sparkle" color="butter" size={34} rotate={-10} className="absolute left-[4%] top-[18%] hidden md:block" />
      <Doodle shape="heart" color="blush" size={26} rotate={12} className="absolute left-[46%] top-[12%] hidden md:block" />
      <Doodle shape="star" color="mint" size={24} rotate={-8} className="absolute bottom-[14%] right-[10%] hidden md:block" />
      <Doodle shape="flower" color="lilac" size={30} className="absolute bottom-[30%] left-[2%] hidden lg:block" />

      <div className="relative mx-auto flex min-h-[88vh] w-full max-w-shell flex-col justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE }}
          className="flex items-center gap-3"
        >
          <Sticker color="peach" rotate={-4}>
            hi, I&apos;m {COPY.hero.name.split(" ")[0].toLowerCase()} ✦
          </Sticker>
          <Waveform className="h-10 w-40" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="mt-8 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl"
        >
          {headline(COPY.hero.headline)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="mt-6 max-w-xl text-xl font-medium leading-relaxed text-ink-muted"
        >
          {COPY.hero.sub}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
          className="mt-4 font-hand text-2xl text-grape"
        >
          {COPY.hero.current}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a href="#work" className="btn btn-primary">
            {COPY.hero.ctaPrimary}
          </a>
          <Link href="/chat" className="btn btn-ghost">
            {COPY.hero.ctaSecondary}
          </Link>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          className="mt-16 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {HERO_STATS.map((s, i) => {
            const st = STAT_STYLE[i % STAT_STYLE.length];
            const number = (
              <span className="font-mono text-xl font-medium text-on-pastel sm:text-2xl">{s.display}</span>
            );
            return (
              <div key={s.label} className={`sticker rounded-[20px] px-4 py-4 text-on-pastel ${st.bg} ${st.tilt}`}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  {s.egg === "dotburst" ? <DotBurst>{number}</DotBurst> : number}
                  <p className="mt-1.5 text-sm font-semibold leading-snug">{s.label}</p>
                </dd>
              </div>
            );
          })}
        </motion.dl>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
          className="mt-8 inline-flex items-center gap-2 font-hand text-xl text-ink-muted"
        >
          <Doodle shape="squiggle" color="berry" size={22} />
          {COPY.hero.statsNote}
        </motion.p>
      </div>
    </section>
  );
}
