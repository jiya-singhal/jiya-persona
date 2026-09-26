import type { Pastel } from "./Doodle";

/** A marker swipe behind the one word that carries the point. */
export function Highlight({
  color = "butter",
  children,
}: {
  color?: Pastel;
  children: React.ReactNode;
}) {
  return (
    <span className="hl" style={{ ["--hl" as string]: `var(--${color})` }}>
      {children}
    </span>
  );
}
