import type { Pastel } from "./Motif";

const BG: Record<Pastel, string> = {
  butter: "bg-butter",
  blush: "bg-blush",
  sky: "bg-sky",
  mint: "bg-mint",
  lilac: "bg-lilac",
  peach: "bg-peach",
};

/** A pill label with an ink outline, for one to three words of status. */
export function Sticker({
  color = "butter",
  className = "",
  children,
}: {
  color?: Pastel;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`sticker inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8125rem] font-extrabold leading-none text-on-pastel ${BG[color]} ${className}`}
    >
      {children}
    </span>
  );
}
