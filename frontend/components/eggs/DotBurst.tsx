"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

/**
 * Hover (or focus) the 21,750 stat and the benchmark grid scatters into
 * a couple hundred tiny accent dots — a representative sample, not all
 * 21,750 DOM nodes. Static under reduced motion.
 */
export function DotBurst({ children }: { children: React.ReactNode }) {
  const [burst, setBurst] = useState(false);
  const reduced = useReducedMotion();

  const dots = useMemo(
    () =>
      Array.from({ length: 180 }, (_, i) => {
        // Deterministic pseudo-random scatter (no Math.random in render).
        const a = Math.sin(i * 12.9898) * 43758.5453;
        const b = Math.sin(i * 78.233) * 12543.2371;
        const rx = (a - Math.floor(a)) * 2 - 1;
        const ry = (b - Math.floor(b)) * 2 - 1;
        return { x: rx * 130, y: ry * 70, d: (i % 10) * 0.012 };
      }),
    [],
  );

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setBurst(true)}
      onMouseLeave={() => setBurst(false)}
      onFocus={() => setBurst(true)}
      onBlur={() => setBurst(false)}
      tabIndex={0}
      aria-label="21,750 benchmark runs — imagine each of these dots times about a hundred"
    >
      {children}
      {!reduced && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          {dots.map((d, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-[2.5px] w-[2.5px] rounded-full bg-accent"
              initial={false}
              animate={
                burst
                  ? { x: d.x, y: d.y, opacity: [0, 0.9, 0.6] }
                  : { x: 0, y: 0, opacity: 0 }
              }
              transition={{ duration: 0.7, delay: burst ? d.d : 0, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
