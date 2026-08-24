"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A polaroid-style print. Photo-free launch: children default to a labeled
 * empty slot, so real photos can drop in later without layout work.
 */
export function PolaroidFrame({
  caption,
  rotate = 2,
  className = "",
  children,
}: {
  caption: string;
  rotate?: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.figure
      className={`bg-linen p-3 pb-2 shadow-sticky ${className}`}
      initial={reduced ? { opacity: 1, rotate } : { opacity: 0, rotate: rotate * 2.5, y: -10 }}
      whileInView={{ opacity: 1, rotate, y: 0 }}
      whileHover={reduced ? undefined : { rotate: rotate * -0.5 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 110, damping: 14 }}
    >
      <div className="aspect-square w-full bg-[#D8CBB2] flex items-center justify-center">
        {children ?? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-paper-ink/40">
            photo, eventually
          </span>
        )}
      </div>
      <figcaption className="pt-2 pb-1 text-center font-hand text-xl text-paper-ink/80">
        {caption}
      </figcaption>
    </motion.figure>
  );
}
