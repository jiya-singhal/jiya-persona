import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Cream & cocoa" palette - cream page, dark-brown ink, light-brown
        // support, one dark espresso feature panel, pastel pops (apricot /
        // sage / rose). No white, no black, no yellow.
        base: "#F6EEDF",
        card: "#EFE4CF",
        espresso: "#38291B",
        line: "#DBCBB0",
        ink: "#33261A",
        sub: "#7C6B54",
        milk: "#F3EAD9",
        butter: "#E8A87C",
        "butter-deep": "#8F5B2E",
        sage: "#5D6547",
        "sage-soft": "#C9D0B5",
        clay: "#B25F51",
        "clay-soft": "#E9C3BE",
        linen: "#FBF6EB",
        // Paper fills for sticky notes (ink text goes on top)
        "paper-butter": "#F2CDA9",
        "paper-sage": "#C9D0B5",
        "paper-blush": "#E9C3BE",
        "paper-ink": "#33261A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        hand: ["var(--font-caveat)", "cursive"],
      },
      maxWidth: {
        prose: "44rem",
        shell: "72rem",
      },
      boxShadow: {
        sticky: "2px 10px 24px -10px rgba(51, 38, 26, 0.35)",
        panel: "0 2px 4px rgba(51, 38, 26, 0.06), 0 18px 40px -18px rgba(51, 38, 26, 0.25)",
      },
      keyframes: {
        marquee: {
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
