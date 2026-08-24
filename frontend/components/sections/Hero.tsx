"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { COPY, HERO_STATS } from "@/content/profile";
import { EASE } from "@/lib/motion";
import { Waveform } from "@/components/primitives/Waveform";
import { Constellation } from "@/components/primitives/Constellation";
import { MoonGlow } from "@/components/primitives/MoonGlow";
import { CountUp } from "@/components/primitives/CountUp";
import { DotBurst } from "@/components/eggs/DotBurst";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <MoonGlow className="absolute inset-0" />
      <Constellation
        className="pointer-events-none absolute -right-24 top-24 hidden w-[34rem] opacity-40 lg:block"
      />

      <div className="relative mx-auto flex min-h-[88vh] w-full max-w-shell flex-col justify-center px-6 py-24">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE }}
          className="font-mono text-xs uppercase tracking-[0.34em] text-mist"
        >
          {COPY.hero.name}
        </motion.p>

        <Waveform className="mt-4 h-10 w-56" />

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="mt-6 max-w-3xl font-serif text-4xl font-medium leading-[1.12] text-ivory sm:text-6xl"
        >
          {COPY.hero.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-mist"
        >
          {COPY.hero.sub}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
          className="mt-4 font-mono text-sm text-accent"
        >
          {COPY.hero.current}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a
            href="#work"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-night transition-colors hover:bg-accent-bright"
          >
            {COPY.hero.ctaPrimary}
          </a>
          <Link
            href="/chat"
            className="rounded-full border border-line px-6 py-3 text-sm text-ivory transition-colors hover:border-accent/60 hover:text-accent"
          >
            {COPY.hero.ctaSecondary}
          </Link>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          className="mt-20 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3"
        >
          {HERO_STATS.map((s) => {
            const number = (
              <CountUp
                value={s.value}
                format={(n) =>
                  `${s.prefix ?? ""}${Math.round(n).toLocaleString("en-US")}${s.suffix ?? ""}`
                }
                className="font-mono text-3xl text-ivory"
              />
            );
            return (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  {s.egg === "dotburst" ? <DotBurst>{number}</DotBurst> : number}
                  <p className="mt-1.5 text-sm leading-snug text-mist">{s.label}</p>
                </dd>
              </div>
            );
          })}
        </motion.dl>
      </div>
    </section>
  );
}
