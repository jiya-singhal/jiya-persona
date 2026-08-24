"use client";

import { motion } from "framer-motion";
import { COPY } from "@/content/profile";
import { EASE, viewportOnce } from "@/lib/motion";
import { Reveal } from "@/components/primitives/Reveal";

/*
 * The site gets quieter here. Big serif statement, a ghungroo drawn in
 * thin lines, one jasmine sprig — and no forced inspirational story.
 */
export function BeyondCode() {
  return (
    <section id="beyond" className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-shell px-6 py-32">
        <p className="font-mono text-sm tracking-[0.3em] text-faint" aria-hidden="true">
          {COPY.beyond.number}
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-accent">
          {COPY.beyond.eyebrow}
        </p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 1.1, ease: EASE }}
          className="mt-10 max-w-3xl font-serif text-4xl font-medium italic leading-[1.15] text-ivory sm:text-5xl"
        >
          {COPY.beyond.statement}
        </motion.h2>

        <div className="mt-16 grid items-center gap-12 md:grid-cols-[auto_1fr]">
          <Reveal delay={0.2}>
            <GhungrooArt />
          </Reveal>
          <Reveal delay={0.35}>
            <div className="max-w-prose">
              <p className="text-lg leading-relaxed text-mist">{COPY.beyond.line}</p>
              <p className="mt-6 font-mono text-sm uppercase tracking-[0.2em] text-ivory">
                {COPY.beyond.credential}
              </p>
              <p className="mt-1 font-serif text-2xl text-silver" lang="hi">
                घुंघरू · rhythm / timing / precision
              </p>
            </div>
          </Reveal>
        </div>

        {/* quiet achievement strip */}
        <Reveal delay={0.5}>
          <div className="mt-20 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
            {COPY.beyond.quiet.map((q) => (
              <span key={q} className="font-mono text-xs tracking-[0.14em] text-mist">
                {q}
              </span>
            ))}
          </div>
        </Reveal>

        {/* one extremely small jasmine sprig, bottom corner */}
        <JasmineSprig className="pointer-events-none absolute bottom-8 right-8 h-16 w-16 opacity-30" />
      </div>
    </section>
  );
}

/** Ghungroo — ankle bells — as a thin-line illustration. */
function GhungrooArt() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="h-36 w-48 text-silver"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      role="img"
      aria-label="Line drawing of ghungroo, the ankle bells worn in Bharatanatyam"
    >
      {/* the strap, a gentle arc */}
      <path d="M10 40 C 50 20, 110 20, 150 40" strokeOpacity="0.8" />
      <path d="M10 46 C 50 26, 110 26, 150 46" strokeOpacity="0.5" />
      {/* bells hanging from the strap */}
      {[
        [28, 44],
        [52, 36],
        [80, 33],
        [108, 36],
        [132, 44],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y + 12} strokeOpacity="0.6" />
          <circle cx={x} cy={y + 19} r="7" strokeOpacity="0.9" />
          <path
            d={`M${x - 3} ${y + 22} L${x + 3} ${y + 22}`}
            strokeOpacity="0.9"
          />
          <circle cx={x} cy={y + 19} r="1" fill="currentColor" fillOpacity="0.7" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

/** A single jasmine sprig, botanical-line style. */
function JasmineSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="rgb(var(--silver))"
      strokeWidth="0.9"
      aria-hidden="true"
    >
      <path d="M8 58 C 20 44, 28 32, 40 18" />
      <path d="M22 42 C 28 40, 32 36, 33 30" />
      <path d="M28 34 C 24 32, 22 28, 23 22" />
      {/* five-petal jasmine bloom */}
      <g transform="translate(44,14)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-6"
            rx="3"
            ry="5.5"
            transform={`rotate(${deg})`}
          />
        ))}
        <circle cx="0" cy="0" r="1.4" fill="rgb(var(--silver))" stroke="none" />
      </g>
    </svg>
  );
}
