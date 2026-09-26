import type { Pastel } from "./Doodle";

const BG: Record<Pastel, string> = {
  butter: "bg-butter",
  blush: "bg-blush",
  sky: "bg-sky",
  mint: "bg-mint",
  lilac: "bg-lilac",
  peach: "bg-peach",
};

/** A tilted pill label that looks slapped onto the page. */
export function Sticker({
  color = "butter",
  rotate = -3,
  className = "",
  children,
}: {
  color?: Pastel;
  rotate?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`sticker inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8125rem] font-extrabold leading-none text-on-pastel ${BG[color]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
