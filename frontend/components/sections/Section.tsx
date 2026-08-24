"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function Section({
  id,
  eyebrow,
  title,
  titleAccent,
  children,
}: {
  id: string;
  eyebrow: ReactNode;
  title: ReactNode;
  titleAccent?: ReactNode;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const initial = reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };

  return (
    <section id={id} className="mx-auto w-full max-w-shell px-6 py-24 sm:py-28">
      <motion.div
        initial={initial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
      >
        <p className="font-mono text-xs tracking-[0.22em] uppercase text-sub">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight">
          {title}
          {titleAccent}
        </h2>
      </motion.div>
      <motion.div
        initial={initial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-10"
      >
        {children}
      </motion.div>
    </section>
  );
}
