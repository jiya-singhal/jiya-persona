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
        // "Daydream" palette: a pastel notebook. Cream dot-grid paper, ink
        // outlines, six candy pastels for fills, five pops for coloured text.
        // All values live as RGB triplets in globals.css so the moon can swap
        // to the "stargazing" night theme wholesale.
        paper: v("paper"),
        "paper-alt": v("paper-alt"),
        card: v("card"),
        grid: v("grid"),
        ink: v("ink"),
        "ink-muted": v("ink-muted"),
        "ink-faint": v("ink-faint"),
        outline: v("outline"),
        "on-pastel": v("on-pastel"),
        // pastels: fills only, identical in both themes, text on them is on-pastel
        butter: v("butter"),
        blush: v("blush"),
        sky: v("sky"),
        mint: v("mint"),
        lilac: v("lilac"),
        peach: v("peach"),
        // pops: coloured text, 4.7:1+ on every paper in both themes
        berry: v("berry"),
        cobalt: v("cobalt"),
        fern: v("fern"),
        grape: v("grape"),
        honey: v("honey"),
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-rounded", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        hand: ["var(--font-caveat)", "cursive"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "44rem",
        shell: "72rem",
      },
      borderWidth: {
        "1.5": "1.5px",
      },
      boxShadow: {
        sticker: "3px 3px 0 0 rgb(var(--shadow-ink))",
        "sticker-lift": "5px 5px 0 0 rgb(var(--shadow-ink))",
        soft: "0 12px 32px -14px rgb(45 38 64 / 0.28)",
      },
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
