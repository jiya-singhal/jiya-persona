import type { Variants } from "framer-motion";

/*
 * The Midnight Lab motion language: slow → deliberate → precise.
 * One shared ease, generous durations, no springs, nothing bounces.
 */

export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = 0.8;

/** Standard viewport-entry treatment: quiet fade + 24px rise. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE },
  },
};

/** Fade only — for elements whose position shouldn't shift. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION, ease: EASE } },
};

/** Parent container that reveals children in sequence. */
export const stagger = (delay = 0.35): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

/** Viewport config: animate once, slightly before fully in view. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
