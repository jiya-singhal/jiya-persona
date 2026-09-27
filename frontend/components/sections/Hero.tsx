"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { COPY, HERO_STATS } from "@/content/profile";
import { EASE } from "@/lib/motion";
import { Waveform } from "@/components/primitives/Waveform";
import { Constellation } from "@/components/primitives/Constellation";
import { Motif, type MotifName } from "@/components/primitives/Motif";
import { Highlight } from "@/components/primitives/Highlight";
import { DotBurst } from "@/components/eggs/DotBurst";

/* Each stat card gets a pastel and the motif of the work it measures. */
const STAT_STYLE: { bg: string; motif: MotifName }[] = [
  { bg: "bg-blush", motif: "latency" },
  { bg: "bg-butter", motif: "check" },
  { bg: "bg-mint", motif: "spectrum" },
  { bg: "bg-sky", motif: "waveform" },
  { bg: "bg-lilac", motif: "braces" },
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
      {/* soft pastel glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px 380px at 85% 20%, rgb(var(--lilac) / 0.4), transparent 70%), radial-gradient(420px 320px at 8% 90%, rgb(var(--blush) / 0.3), transparent 70%)",
        }}
      />
      <Constellation className="pointer-events-none absolute -right-24 top-32 hidden w-[34rem] opacity-70 lg:block" />

      <div className="relative mx-auto flex min-h-[88vh] w-full max-w-shell flex-col justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE }}
          className="flex items-center gap-4"
        >
          <p className="font-mono text-sm font-medium uppercase tracking-[0.2em] text-ink-muted">
            {COPY.hero.name}
          </p>
          <Waveform className="h-10 w-40" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="mt-6 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl"
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
          className="mt-4 font-mono text-sm text-grape"
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
              <div key={s.label} className={`sticker rounded-[20px] px-4 py-4 text-on-pastel ${st.bg}`}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <Motif name={st.motif} bare size={18} className="mb-2 opacity-70" />
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
          className="mt-8 font-hand text-xl text-ink-muted"
        >
          {COPY.hero.statsNote}
        </motion.p>
      </div>
    </section>
  );
}
