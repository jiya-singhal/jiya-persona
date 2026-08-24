"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const FILLS = {
  linen: "bg-linen",
  butter: "bg-paper-butter",
  sage: "bg-paper-sage",
  blush: "bg-paper-blush",
} as const;

/** A paper sticky note catching the light - dark ink text on a light fill. */
export function StickyNote({
  color = "butter",
  rotate = -2,
  className = "",
  delay = 0,
  children,
}: {
  color?: keyof typeof FILLS;
  rotate?: number;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={`relative ${FILLS[color]} text-paper-ink shadow-sticky rounded-sm p-5 ${className}`}
      initial={
        reduced
          ? { opacity: 1, rotate }
          : { opacity: 0, rotate: rotate * 3, y: -12 }
      }
      whileInView={{ opacity: 1, rotate, y: 0 }}
      whileHover={reduced ? undefined : { rotate: 0, scale: 1.02 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 120, damping: 13, delay }}
    >
      {/* folded corner */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-0 w-0 border-l-[14px] border-t-[14px] border-l-transparent border-t-black/10"
        style={{ borderTopColor: "rgba(0,0,0,0.12)" }}
      />
      {children}
    </motion.div>
  );
}
