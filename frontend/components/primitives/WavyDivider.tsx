import { Motif, type Pop } from "./Motif";

/** Section break: a quiet signal trace between two small waveform marks. */
export function WavyDivider({ color = "berry", waves = 36 }: { color?: Pop; waves?: number }) {
  let d = "M0 8";
  for (let i = 0; i < waves; i++) d += ` q 10 ${i % 2 ? 6 : -6} 20 0`;
  return (
    <div aria-hidden="true" className="mx-auto flex w-full max-w-shell items-center gap-3 px-6 py-6 text-ink-faint">
      <Motif name="waveform" bare size={20} />
      <svg viewBox={`0 0 ${waves * 20} 16`} preserveAspectRatio="none" className="h-4 min-w-0 flex-1 overflow-visible">
        <path
          d={d}
          vectorEffect="non-scaling-stroke"
          fill="none"
          stroke={`rgb(var(--${color}))`}
          strokeOpacity={0.7}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
      <Motif name="waveform" bare size={20} />
    </div>
  );
}
