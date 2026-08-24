"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** A small handwritten margin note that settles into place. */
export function Annotation({
  children,
  className = "",
  rotate = -3,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      className={`inline-block font-hand text-2xl leading-tight ${className}`}
      style={{ rotate: reduced ? rotate : undefined }}
      initial={reduced ? { opacity: 1, rotate } : { opacity: 0, y: 8, rotate: rotate * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.span>
  );
}
