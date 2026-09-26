"use client";

import { COPY, MEASURING } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";
import { Doodle } from "@/components/primitives/Doodle";

const CELL = ["bg-mint", "bg-sky", "bg-butter", "bg-lilac", "bg-blush", "bg-peach"];

export function Measuring() {
  return (
    <section id="measuring" className="relative">
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <SectionHeading
          number={COPY.measuring.number}
          eyebrow={COPY.measuring.eyebrow}
          title={COPY.measuring.title}
          color="mint"
        />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {MEASURING.map((m, i) => (
            <Reveal key={m.thing} delay={i * 0.06}>
              <div className={`sticker h-full rounded-[20px] px-6 py-7 text-on-pastel ${CELL[i % CELL.length]}`}>
                <h3 className="font-display text-xl font-semibold">{m.thing}</h3>
                <p className="mt-2 font-mono text-sm">{m.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-8 inline-flex items-center gap-2 font-hand text-2xl text-fern">
            <Doodle shape="star" color="mint" size={22} rotate={-12} />
            {COPY.measuring.tagline}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
