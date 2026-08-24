import type { Config } from "tailwindcss";

/** Token helper: CSS variable holding an RGB triplet, alpha-aware. */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Midnight Lab" palette — deep blue-black night, soft ivory ink,
        // one periwinkle accent, silver details. All values live as RGB
        // triplets in globals.css so 2 AM mode can swap them wholesale.
        night: v("night"),
        deep: v("deep"),
        panel: v("panel"),
        line: v("line"),
        ivory: v("ivory"),
        mist: v("mist"),
        faint: v("faint"),
        accent: v("accent"),
        "accent-bright": v("accent-bright"),
        silver: v("silver"),
        good: v("good"),
        warn: v("warn"),
        poor: v("poor"),
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "44rem",
        shell: "72rem",
      },
      boxShadow: {
        glow: "0 0 40px -12px rgb(var(--accent) / 0.25)",
        panel:
          "0 1px 2px rgb(0 0 0 / 0.4), 0 24px 60px -30px rgb(0 0 0 / 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
