"use client";

import { BRAIN, COPY, PHILOSOPHY } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";
import { Motif } from "@/components/primitives/Motif";

/* Field notes cycle through the pastels. */
const NOTE_STYLE = ["bg-butter", "bg-blush", "bg-mint", "bg-sky", "bg-lilac", "bg-peach", "bg-mint", "bg-butter"];

export function HowIThink() {
  return (
    <section id="think" className="relative">
      <Motif name="pitch" color="butter" size={48} className="absolute right-[6%] top-24 hidden md:grid" />
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <SectionHeading
          number={COPY.think.number}
          eyebrow={COPY.think.eyebrow}
          title={COPY.think.title}
          color="butter"
        />
        <Reveal>
          <p className="max-w-prose text-xl font-medium leading-relaxed text-ink-muted">{COPY.think.body}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PHILOSOPHY.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="sticker h-full rounded-[20px] bg-card p-6">
                <span
                  className="inline-grid h-8 w-8 place-items-center rounded-full border-1.5 border-outline bg-butter font-mono text-xs text-on-pastel"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* quick-fire field notes: a wall of sticky notes */}
        <div className="mt-16 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {BRAIN.map((b, i) => (
            <Reveal key={b.q} delay={i * 0.04}>
              <div
                className={`h-full rounded-[14px] border-1.5 border-outline px-5 py-5 text-on-pastel ${NOTE_STYLE[i % NOTE_STYLE.length]}`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-80">{b.q}</p>
                {b.egg === "benchmark" ? (
                  <p className="group/pf mt-1.5 cursor-help text-base font-bold">
                    <span className="group-hover/pf:hidden">{b.a}</span>
                    <span className="hidden group-hover/pf:inline">needs another benchmark</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-base font-bold">{b.a}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
