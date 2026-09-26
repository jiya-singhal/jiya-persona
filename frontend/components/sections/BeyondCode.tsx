"use client";

import { motion } from "framer-motion";
import { COPY } from "@/content/profile";
import { EASE, viewportOnce } from "@/lib/motion";
import { Reveal } from "@/components/primitives/Reveal";
import { Doodle } from "@/components/primitives/Doodle";
import { Sticker } from "@/components/primitives/Sticker";

/*
 * The personal page of the notebook, in lilac and grape. A big soft
 * statement, the ghungroo drawn in ink on a card, a few stickers for the
 * small facts, and no forced inspirational story.
 */
export function BeyondCode() {
  return (
    <section id="beyond" className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-shell px-6 py-32">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="sticker inline-grid h-10 w-10 -rotate-6 place-items-center rounded-full bg-lilac font-mono text-sm text-on-pastel"
          >
            {COPY.beyond.number}
          </span>
          <p className="font-hand text-2xl font-semibold leading-none text-grape">
            {COPY.beyond.eyebrow} ↘
          </p>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 1.1, ease: EASE }}
          className="mt-8 max-w-3xl font-display text-4xl font-semibold italic leading-[1.1] text-ink sm:text-5xl"
        >
          {COPY.beyond.statement}
        </motion.h2>

        <div className="mt-16 grid items-center gap-12 md:grid-cols-[auto_1fr]">
          <Reveal delay={0.2}>
            <div className="sticker relative -rotate-2 rounded-[20px] bg-lilac p-5">
              <GhungrooArt />
              <Doodle shape="sparkle" color="butter" size={26} rotate={12} className="absolute -right-3 -top-3" />
            </div>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="max-w-prose">
              <p className="text-xl font-medium leading-relaxed text-ink-muted">{COPY.beyond.line}</p>
              <p className="mt-6">
                <Sticker color="lilac" rotate={-2}>
                  {COPY.beyond.credential}
                </Sticker>
              </p>
              <p className="mt-4 font-hand text-2xl text-grape" lang="hi">
                घुंघरू · rhythm / timing / precision
              </p>
            </div>
          </Reveal>
        </div>

        {/* quiet achievement strip */}
        <Reveal delay={0.5}>
          <div className="mt-16 flex flex-wrap gap-4">
            {COPY.beyond.quiet.map((q, i) => (
              <Sticker key={q} color={(["butter", "mint", "peach"] as const)[i % 3]} rotate={[2, -3, 1][i % 3]}>
                {q}
              </Sticker>
            ))}
          </div>
        </Reveal>

        {/* one extremely small jasmine sprig, bottom corner */}
        <JasmineSprig className="pointer-events-none absolute bottom-8 right-8 h-20 w-20" />
      </div>
    </section>
  );
}

/** Ghungroo — ankle bells — as a thin-line illustration. */
function GhungrooArt() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="h-36 w-48 text-on-pastel"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
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
      stroke="rgb(var(--outline))"
      strokeWidth="1.2"
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
            fill="rgb(var(--card))"
          />
        ))}
        <circle cx="0" cy="0" r="2" fill="rgb(var(--butter))" />
      </g>
    </svg>
  );
}
