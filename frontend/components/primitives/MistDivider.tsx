/**
 * Mist between sections: a soft gradient band easing night into deep
 * (or back). Pure CSS, no content.
 */
export function MistDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`h-24 w-full ${flip ? "mist-bottom" : "mist-top"}`}
    />
  );
}
