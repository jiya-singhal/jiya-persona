"use client";

import { COPY, MEASURING } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";

export function Measuring() {
  return (
    <section id="measuring">
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <SectionHeading
          number={COPY.measuring.number}
          eyebrow={COPY.measuring.eyebrow}
          title={COPY.measuring.title}
        />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {MEASURING.map((m, i) => (
            <Reveal key={m.thing} delay={i * 0.06} className="bg-night">
              <div className="h-full px-6 py-8">
                <h3 className="text-lg font-semibold text-ivory">{m.thing}</h3>
                <p className="mt-2 font-mono text-base text-accent">{m.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 font-mono text-sm text-faint">{COPY.measuring.tagline}</p>
        </Reveal>
      </div>
    </section>
  );
}
