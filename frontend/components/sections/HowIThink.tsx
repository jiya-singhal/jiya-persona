"use client";

import { BRAIN, COPY, PHILOSOPHY } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";

export function HowIThink() {
  return (
    <section id="think" className="bg-deep">
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <SectionHeading
          number={COPY.think.number}
          eyebrow={COPY.think.eyebrow}
          title={COPY.think.title}
          serif
        />
        <Reveal>
          <p className="max-w-prose text-xl leading-relaxed text-mist">{COPY.think.body}</p>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {PHILOSOPHY.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="border-l border-line pl-6">
                <span
                  className="font-mono text-xs tracking-[0.24em] text-faint"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-ivory">{p.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-mist">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* quick-fire field notes — the lightly playful layer */}
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          {BRAIN.map((b, i) => (
            <Reveal key={b.q} delay={i * 0.04} className="bg-deep">
              <div className="h-full px-5 py-5">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-mist">
                  {b.q}
                </p>
                {b.egg === "benchmark" ? (
                  <p className="group/pf mt-1.5 cursor-help text-base text-ivory">
                    <span className="group-hover/pf:hidden">{b.a}</span>
                    <span className="hidden text-warn group-hover/pf:inline">
                      needs another benchmark
                    </span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-base text-ivory">{b.a}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
