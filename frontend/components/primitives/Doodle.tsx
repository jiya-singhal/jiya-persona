/*
 * Little hand-drawn shapes: a pastel fill with an ink outline. They are the
 * "elements all over" of the Daydream look. Decorative, so aria-hidden.
 */

export type Pastel = "butter" | "blush" | "sky" | "mint" | "lilac" | "peach";
export type Pop = "berry" | "cobalt" | "fern" | "grape" | "honey";
export type Shape = "sparkle" | "star" | "heart" | "moon" | "flower" | "cloud" | "squiggle";

const PATHS: Record<Shape, string> = {
  sparkle:
    "M12 1.5c.9 5.4 2.9 7.8 9.5 9.1v.8c-6.6 1.3-8.6 3.7-9.5 9.1h-.8c-.9-5.4-2.9-7.8-9.5-9.1v-.8c6.6-1.3 8.6-3.7 9.5-9.1z",
  star: "M12 2.2l2.9 6.1 6.6.8-4.9 4.5 1.3 6.5L12 16.9l-5.9 3.2 1.3-6.5-4.9-4.5 6.6-.8z",
  heart: "M12 20.5s-8.5-5-8.5-11A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.5 2.7c0 6-8.5 11-8.5 11z",
  moon: "M15.5 2.8a9.5 9.5 0 1 0 5.7 13.9A8 8 0 0 1 15.5 2.8z",
  flower:
    "M12 8.2a3 3 0 1 1 3.3-3.2 3 3 0 1 1 1.7 5.6 3 3 0 1 1-1.2 5.5 3 3 0 1 1-5.6 0 3 3 0 1 1-1.2-5.5 3 3 0 1 1 1.7-5.6A3 3 0 0 1 12 8.2z",
  cloud: "M7 18.5a4.5 4.5 0 0 1-.6-9 5.5 5.5 0 0 1 10.6-1.3A4.5 4.5 0 1 1 17.5 18.5z",
  squiggle: "M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0 3.5-4 5-2",
};

export function Doodle({
  shape = "sparkle",
  color,
  size = 28,
  rotate = 0,
  className = "",
  outline = "var(--outline)",
}: {
  shape?: Shape;
  color?: Pastel | Pop;
  size?: number;
  rotate?: number;
  className?: string;
  /** CSS colour triplet var for the stroke; on a pastel use "var(--on-pastel)". */
  outline?: string;
}) {
  const line = shape === "squiggle";
  const fill = `rgb(var(--${color ?? (line ? "berry" : "butter")}))`;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={`inline-block shrink-0 overflow-visible ${className}`}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path
        d={PATHS[shape]}
        fill={line ? "none" : fill}
        stroke={line ? fill : `rgb(${outline})`}
        strokeWidth={line ? 2.2 : 1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {shape === "flower" && (
        <circle cx={12} cy={12} r={2.6} fill="rgb(var(--butter))" stroke={`rgb(${outline})`} strokeWidth={1.4} />
      )}
    </svg>
  );
}
