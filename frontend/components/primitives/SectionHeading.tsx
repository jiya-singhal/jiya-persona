"use client";

import { motion } from "framer-motion";
import { EASE, viewportOnce } from "@/lib/motion";
import type { Pastel } from "./Motif";

/*
 * Each section family pairs a pastel (the number sticker) with a pop colour
 * (the hand-written eyebrow): Work blush/berry, Thinking butter/honey,
 * Measuring mint/fern, Beyond code lilac/grape, Chat sky/cobalt.
 */
const FAMILY: Record<Pastel, { bg: string; text: string }> = {
  blush: { bg: "bg-blush", text: "text-berry" },
  butter: { bg: "bg-butter", text: "text-honey" },
  mint: { bg: "bg-mint", text: "text-fern" },
  lilac: { bg: "bg-lilac", text: "text-grape" },
  sky: { bg: "bg-sky", text: "text-cobalt" },
  peach: { bg: "bg-peach", text: "text-berry" },
};

/**
 * Section opener: the number in a pastel badge, a mono eyebrow in the
 * family's pop colour, and the section title in soft Fraunces.
 */
export function SectionHeading({
  number,
  eyebrow,
  title,
  color = "blush",
}: {
  number: string;
  eyebrow: string;
  title: React.ReactNode;
  color?: Pastel;
}) {
  const f = FAMILY[color];
  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex items-center gap-3"
      >
        <span
          aria-hidden="true"
          className={`inline-grid h-9 w-9 place-items-center rounded-full border-1.5 border-outline font-mono text-sm text-on-pastel ${f.bg}`}
        >
          {number}
        </span>
        <p className={`font-mono text-sm font-medium uppercase tracking-[0.16em] ${f.text}`}>{eyebrow}</p>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl"
      >
        {title}
      </motion.h2>
    </div>
  );
}
