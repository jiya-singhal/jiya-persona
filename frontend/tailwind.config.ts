import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Stage" palette — deep indigo-black stage, temple gold + kumkum
        // vermilion pulled from Bharatanatyam costume against dark stage light.
        stage: "#0F0D14",
        curtain: "#171420",
        veil: "#2A2536",
        ivory: "#F2EDE4",
        mist: "#9A93A8",
        gold: "#D8A960",
        kumkum: "#C8502E",
        // Legacy aliases still referenced by chat components
        bg: "#0F0D14",
        ink: "#F2EDE4",
        muted: "#9A93A8",
        rule: "#2A2536",
        clay: "#D8A960",
        chip: "#171420",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "44rem",
        shell: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
