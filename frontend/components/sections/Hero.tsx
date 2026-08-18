"use client";

import { motion } from "framer-motion";
import { ArrowDown, CalendarClock, FileText } from "lucide-react";
import { PitchCanvas } from "../PitchCanvas";
import { LINKS, STATS } from "@/content/profile";

export function Hero() {
  return (
    <section className="relative min-h-[92svh] flex flex-col justify-center overflow-hidden">
      <PitchCanvas className="absolute inset-x-0 bottom-0 h-[46svh] w-full" />

      <div className="relative mx-auto w-full max-w-shell px-6 pt-24 pb-[38svh]">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs tracking-[0.22em] uppercase text-mist"
        >
          Jiya Singhal · AI/ML engineer · Bangalore
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 font-display text-5xl sm:text-6xl md:text-7xl leading-[1.04] tracking-tight max-w-4xl"
        >
          She builds systems{" "}
          <span className="text-gold italic">that listen.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="mt-6 max-w-xl text-lg text-mist leading-relaxed"
        >
          Voice pipelines, pitch detection, audio quality — benchmarked before
          believed. Trained Bharatanatyam dancer; the ear came first.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a
            href="#chat"
            className="inline-flex items-center gap-2 rounded-full bg-kumkum px-5 py-3 text-sm font-medium text-ivory hover:bg-kumkum/85 transition-colors"
          >
            Interview her AI rep
            <ArrowDown className="h-4 w-4" />
          </a>
          <a
            href="#book"
            className="inline-flex items-center gap-2 rounded-full border border-veil px-5 py-3 text-sm text-ivory hover:border-gold/60 transition-colors"
          >
            <CalendarClock className="h-4 w-4 text-gold" />
            Book a call
          </a>
          <a
            href={LINKS.resume}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-veil px-5 py-3 text-sm text-ivory hover:border-gold/60 transition-colors"
          >
            <FileText className="h-4 w-4 text-gold" />
            Resume
          </a>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 max-w-3xl"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-mono text-gold text-lg">{s.value}</dd>
              <dd className="mt-1 text-xs text-mist leading-snug">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
