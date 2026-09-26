import { Doodle, type Pop } from "./Doodle";

/** Section break: a hand-drawn wave with a sparkle and a heart on its ends. */
export function WavyDivider({ color = "berry", waves = 36 }: { color?: Pop; waves?: number }) {
  let d = "M0 8";
  for (let i = 0; i < waves; i++) d += ` q 10 ${i % 2 ? 8 : -8} 20 0`;
  return (
    <div aria-hidden="true" className="mx-auto flex w-full max-w-shell items-center gap-3 px-6 py-6">
      <Doodle shape="sparkle" color="butter" size={22} rotate={-10} />
      <svg viewBox={`0 0 ${waves * 20} 16`} preserveAspectRatio="none" className="h-4 min-w-0 flex-1 overflow-visible">
        <path
          d={d}
          vectorEffect="non-scaling-stroke"
          fill="none"
          stroke={`rgb(var(--${color}))`}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <Doodle shape="heart" color="blush" size={20} rotate={8} />
    </div>
  );
}
