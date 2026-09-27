/*
 * Small ink-line motifs drawn from the work itself, used as the site's
 * decoration instead of generic doodles. Each one points at something on
 * the resume: the voice pipeline's waveform, swift-f0's pitch contour,
 * voicequal's spectrum, the KV cache's hash ring, the terminal, the
 * benchmark suite, the code. Decorative, so aria-hidden.
 */

export type Pastel = "butter" | "blush" | "sky" | "mint" | "lilac" | "peach";
export type Pop = "berry" | "cobalt" | "fern" | "grape" | "honey";
export type MotifName =
  | "waveform"
  | "pitch"
  | "spectrum"
  | "nodes"
  | "prompt"
  | "check"
  | "braces"
  | "latency";

/* 24x24 line drawings, stroked in ink. */
function Lines({ name }: { name: MotifName }) {
  switch (name) {
    case "waveform": // voice pipeline: an audio amplitude trace
      return <path d="M2 12h2.5l1.5-4 2.5 9 2.5-13 2.5 15 2.5-10 1.5 5 1.5-2H22" />;
    case "pitch": // swift-f0: a pitch contour with detected frames
      return (
        <>
          <path d="M3 17c2.5 0 3-9 6-9s2.5 6 5 6 3.5-8 7-8" />
          <circle cx="9" cy="8" r="1.3" fill="currentColor" />
          <circle cx="14" cy="14" r="1.3" fill="currentColor" />
          <circle cx="21" cy="6" r="1.3" fill="currentColor" />
        </>
      );
    case "spectrum": // voicequal: spectral bars
      return <path d="M4 20v-5M8 20V9M12 20V4M16 20v-8M20 20v-4" />;
    case "nodes": // KV cache: three nodes on a hash ring
      return (
        <>
          <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2.6" />
          <circle cx="12" cy="4.5" r="2.2" fill="currentColor" />
          <circle cx="18.5" cy="15.8" r="2.2" fill="currentColor" />
          <circle cx="5.5" cy="15.8" r="2.2" fill="currentColor" />
        </>
      );
    case "prompt": // the terminal
      return <path d="M4 7l5 5-5 5M12 18h8" />;
    case "check": // the benchmark suite
      return <path d="M4 12.5l5 5L20 6.5" />;
    case "braces": // the code
      return (
        <path d="M9 4c-2 0-3 1-3 3v2.5c0 1.2-.8 2.5-2 2.5 1.2 0 2 1.3 2 2.5V17c0 2 1 3 3 3M15 4c2 0 3 1 3 3v2.5c0 1.2.8 2.5 2 2.5-1.2 0-2 1.3-2 2.5V17c0 2-1 3-3 3" />
      );
    case "latency": // 57s → 15s: a falling p50 line
      return <path d="M3 5l5 7 4-3 9 10M15 19h6v-6" />;
  }
}

const BG: Record<Pastel, string> = {
  butter: "bg-butter",
  blush: "bg-blush",
  sky: "bg-sky",
  mint: "bg-mint",
  lilac: "bg-lilac",
  peach: "bg-peach",
};

/**
 * A motif in a pastel tile with an ink outline, or `bare` as a plain line
 * icon in the current text colour.
 */
export function Motif({
  name,
  color = "butter",
  size = 40,
  bare = false,
  className = "",
}: {
  name: MotifName;
  color?: Pastel;
  size?: number;
  bare?: boolean;
  className?: string;
}) {
  const svg = (
    <svg
      viewBox="0 0 24 24"
      width={bare ? size : Math.round(size * 0.55)}
      height={bare ? size : Math.round(size * 0.55)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={bare ? `shrink-0 ${className}` : undefined}
    >
      <Lines name={name} />
    </svg>
  );
  if (bare) return svg;
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-[12px] border-1.5 border-outline text-on-pastel ${BG[color]} ${className}`}
      style={{ width: size, height: size }}
    >
      {svg}
    </span>
  );
}
