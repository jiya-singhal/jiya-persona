"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Hand-drawn SVG accents that draw themselves in when scrolled into view.
 * Stroke colour comes from currentColor - set it with a text-* class.
 */

const PATHS: Record<string, { viewBox: string; d: string[] }> = {
  circle: {
    viewBox: "0 0 120 60",
    d: ["M60 6 C90 4 114 16 113 30 C112 46 86 56 58 55 C30 54 8 44 8 29 C8 14 30 5 68 8"],
  },
  underline: {
    viewBox: "0 0 200 20",
    d: ["M4 12 C40 6 80 16 120 10 C150 6 180 13 196 9"],
  },
  arrow: {
    viewBox: "0 0 100 60",
    d: ["M6 52 C28 44 58 24 84 15", "M72 8 L86 14 L78 28"],
  },
  star: {
    viewBox: "0 0 40 40",
    d: ["M20 4 L23 16 L36 20 L23 24 L20 36 L17 24 L4 20 L17 16 Z"],
  },
  squiggle: {
    viewBox: "0 0 120 30",
    d: ["M4 18 C14 6 24 26 34 15 C44 5 54 25 64 15 C74 5 84 25 94 15 C104 6 112 18 116 14"],
  },
};

export type DoodleKind = keyof typeof PATHS;

export function Doodle({
  kind,
  className = "",
  delay = 0,
  strokeWidth = 2.5,
}: {
  kind: DoodleKind;
  className?: string;
  delay?: number;
  strokeWidth?: number;
}) {
  const reduced = useReducedMotion();
  const { viewBox, d } = PATHS[kind];

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      {d.map((path, i) => (
        <motion.path
          key={i}
          d={path}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: delay + i * 0.25, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
