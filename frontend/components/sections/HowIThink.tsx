"use client";

import { COPY, PHILOSOPHY } from "@/content/profile";
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
          <p className="max-w-prose text-lg leading-relaxed text-mist">{COPY.think.body}</p>
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
                <h3 className="mt-2 text-lg font-semibold text-ivory">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mist">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
