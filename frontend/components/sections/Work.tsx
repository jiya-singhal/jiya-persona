"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Section } from "./Section";
import { Annotation } from "../doodles/Annotation";
import { Doodle } from "../doodles/Doodle";
import { COPY, EXPERIENCE, STATS } from "@/content/profile";

/** Animates every number inside a string (e.g. "5.5% → 0.6%") counting up in view. */
function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : value.replace(/[\d,]+(\.\d+)?/g, "0"));

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const duration = 1200;
    let raf = 0;
    const start = performance.now();

    function frame(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(
        value.replace(/[\d,]+(\.\d+)?/g, (m) => {
          const target = parseFloat(m.replace(/,/g, ""));
          const decimals = m.includes(".") ? m.split(".")[1].length : 0;
          const current = target * eased;
          const text = current.toFixed(decimals);
          return m.includes(",")
            ? Number(text).toLocaleString("en-US", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })
            : text;
        }),
      );
      if (t < 1) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

function StoryExpander({
  bullets,
  label,
  dark = false,
}: {
  bullets: { title: string; body: string }[];
  label: string;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline ${
          dark ? "text-butter" : "text-sage"
        }`}
      >
        {open ? "less" : label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={`space-y-5 border-l pl-6 pt-5 ${
                dark ? "border-milk/15" : "border-ink/15"
              }`}
            >
              {bullets.map((b) => (
                <div key={b.title}>
                  <h4 className={`font-medium ${dark ? "text-milk" : "text-ink"}`}>{b.title}</h4>
                  <p
                    className={`mt-1 text-[15px] leading-relaxed ${
                      dark ? "text-milk/65" : "text-sub"
                    }`}
                  >
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Work() {
  const [song, trade] = EXPERIENCE;

  return (
    <Section
      id="work"
      eyebrow={COPY.work.eyebrow}
      title={COPY.work.title}
      titleAccent={
        <Annotation rotate={-2} delay={0.3} className="ml-5 align-middle text-butter-deep">
          {COPY.work.annotation}
        </Annotation>
      }
    >
      <p className="-mt-4 mb-12 max-w-prose text-[15px] leading-relaxed text-sub">
        {COPY.work.framing}
      </p>

      {/* Sing One Song - the flagship, a dark espresso panel */}
      <article className="rounded-2xl bg-espresso p-7 text-milk shadow-panel sm:p-9">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <a
            href={song.url}
            target="_blank"
            rel="noreferrer"
            className="font-display text-3xl text-milk transition-colors hover:text-butter"
          >
            {song.company}
          </a>
          <div className="font-mono text-xs text-milk/50">
            {song.role} · {song.period} · {song.location}
          </div>
        </header>

        <dl className="mt-9 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
          {STATS.map((s, i) => (
            <div key={s.label} className={i % 2 === 1 ? "sm:pl-10 sm:border-l sm:border-milk/15" : ""}>
              <dd className="relative w-fit font-display text-4xl text-milk sm:text-5xl">
                <CountUp value={s.value} />
                {s.value.includes("0.6%") ? (
                  <Doodle
                    kind="circle"
                    delay={1.2}
                    className="pointer-events-none absolute -inset-x-4 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+2rem)] text-clay-soft"
                    strokeWidth={2}
                  />
                ) : null}
              </dd>
              <dt className="mt-2 max-w-[30ch] text-sm leading-snug text-milk/60">{s.label}</dt>
            </div>
          ))}
        </dl>

        {/* the audio games themselves - playable */}
        <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-milk/15 p-4">
          <p className="text-[15px] text-milk/85">{COPY.work.arcade.lead}</p>
          <a
            href={COPY.work.arcade.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-butter px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-butter/90"
          >
            {COPY.work.arcade.cta}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <span className="font-hand text-xl text-milk/60">{COPY.work.arcade.joke}</span>
        </div>

        <div className="mt-7">
          <StoryExpander bullets={song.bullets} label="+ the full story" dark />
        </div>
      </article>

      {/* Tradeindia - smaller cream card, same honesty */}
      <article className="mt-8 rounded-2xl bg-linen p-7 text-ink shadow-panel sm:p-9">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <a
            href={trade.url}
            target="_blank"
            rel="noreferrer"
            className="font-display text-2xl text-ink transition-colors hover:text-butter-deep"
          >
            {trade.company}
          </a>
          <div className="font-mono text-xs text-sub">
            {trade.role} · {trade.period} · {trade.location}
          </div>
        </header>

        {trade.metric ? (
          <div className="mt-7">
            <div className="font-display text-4xl text-ink">
              <CountUp value={trade.metric.value} />
            </div>
            <div className="mt-2 text-sm text-sub">{trade.metric.label}</div>
          </div>
        ) : null}

        <div className="mt-7">
          <StoryExpander bullets={trade.bullets} label="+ the full story" />
        </div>
      </article>
    </Section>
  );
}
