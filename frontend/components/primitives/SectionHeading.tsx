"use client";

import { motion } from "framer-motion";
import { EASE, viewportOnce } from "@/lib/motion";

/**
 * Section opener: a mono section number that fades quietly to half
 * opacity, an accent eyebrow, and the section title.
 */
export function SectionHeading({
  number,
  eyebrow,
  title,
  serif = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  serif?: boolean;
}) {
  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={viewportOnce}
        transition={{ duration: 1.2, ease: EASE }}
        className="font-mono text-sm tracking-[0.3em] text-faint"
        aria-hidden="true"
      >
        {number}
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className="mt-3 font-mono text-sm uppercase tracking-[0.22em] text-accent"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className={
          serif
            ? "mt-3 font-serif text-4xl font-medium leading-tight text-ivory sm:text-5xl"
            : "mt-3 text-4xl font-semibold leading-tight tracking-tight text-ivory sm:text-5xl"
        }
      >
        {title}
      </motion.h2>
    </div>
  );
}
