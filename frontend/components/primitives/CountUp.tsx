"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Counts a number up exactly once when it enters the viewport.
 * Renders the final value immediately under reduced motion.
 * Non-numeric parts of `value` (arrows, %, commas) are preserved:
 * pass e.g. value={21750} format={(n) => n.toLocaleString("en-US")}.
 */
export function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  className,
  duration = 1.2,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) {
      el.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        el.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, format, reduced]);

  return (
    <span ref={ref} className={className}>
      {format(reduced ? value : 0)}
    </span>
  );
}
