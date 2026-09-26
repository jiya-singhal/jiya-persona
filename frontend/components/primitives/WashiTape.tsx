import type { Pastel } from "./Doodle";

const PATTERN: Record<Pastel, string> = {
  blush: "repeating-linear-gradient(45deg, rgb(var(--blush)) 0 8px, #fff6f8 8px 14px)",
  butter: "repeating-linear-gradient(45deg, rgb(var(--butter)) 0 8px, #fffbe8 8px 14px)",
  mint: "repeating-linear-gradient(90deg, rgb(var(--mint)) 0 6px, #f1fbf5 6px 12px)",
  sky: "radial-gradient(circle, #ffffff 2px, transparent 2.5px) 0 0 / 10px 10px, rgb(var(--sky))",
  lilac: "repeating-linear-gradient(-45deg, rgb(var(--lilac)) 0 8px, #f6f2ff 8px 14px)",
  peach: "repeating-linear-gradient(90deg, rgb(var(--peach)) 0 10px, #fff4ec 10px 14px)",
};

/** A translucent strip of patterned tape with torn ends, for pinning cards. */
export function WashiTape({
  color = "blush",
  width = 96,
  rotate = -4,
  className = "",
}: {
  color?: Pastel;
  width?: number;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`tape ${className}`}
      style={{ width, background: PATTERN[color], transform: `rotate(${rotate}deg)` }}
    />
  );
}
