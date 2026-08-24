"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, FileText } from "lucide-react";
import { PitchCanvas } from "../PitchCanvas";
import { Doodle } from "../doodles/Doodle";
import { StickyNote } from "../doodles/StickyNote";
import { PolaroidFrame } from "../doodles/PolaroidFrame";
import { Marquee } from "../doodles/Marquee";
import { COPY, LINKS } from "@/content/profile";

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const ghostY = useTransform(scrollY, [0, 700], [0, reduced ? 0 : 90]);
  const collageY = useTransform(scrollY, [0, 700], [0, reduced ? 0 : -45]);

  // Golden-hour spotlight: warm light follows the cursor, gently lerped.
  useEffect(() => {
    const section = sectionRef.current;
    const spot = spotRef.current;
    if (!section || !spot) return;
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;

    let tx = 55;
    let ty = 35;
    let x = tx;
    let y = ty;
    let raf = 0;

    function onMove(e: PointerEvent) {
      if (!section) return;
      const r = section.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
    }

    function loop() {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      if (spot) {
        spot.style.background = `radial-gradient(640px circle at ${x}% ${y}%, rgba(232, 168, 124, 0.22), transparent 68%)`;
      }
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const line = (delay: number) =>
    reduced
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { type: "spring" as const, stiffness: 90, damping: 16, delay },
        };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[94svh] flex-col justify-center overflow-hidden"
    >
      {/* warm cursor light */}
      <div ref={spotRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />

      {/* giant ghost name drifting behind everything */}
      <motion.div
        aria-hidden="true"
        style={{ y: ghostY }}
        className="pointer-events-none absolute inset-x-0 top-[6svh] select-none text-center font-display text-[34vw] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(143,91,46,0.14)]"
      >
        JIYA
      </motion.div>

      <PitchCanvas className="absolute inset-x-0 bottom-10 h-[30svh] w-full" />

      <div className="relative mx-auto grid w-full max-w-shell gap-12 px-6 pb-24 pt-28 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <motion.p
            {...line(0)}
            className="font-mono text-xs uppercase tracking-[0.22em] text-sub"
          >
            jiya singhal · bangalore
          </motion.p>

          <h1 className="mt-6 font-display text-4xl leading-[1.06] tracking-tight text-ink sm:text-5xl md:text-6xl">
            <motion.span {...line(0.1)} className="block">
              {COPY.hero.headline[0]}
            </motion.span>
            <motion.span
              {...line(0.22)}
              className="relative mt-1 block w-fit text-5xl italic text-butter-deep sm:text-6xl md:text-7xl"
            >
              {COPY.hero.headline[1]}
              <Doodle
                kind="underline"
                delay={0.9}
                className="absolute -bottom-3 left-0 h-4 w-full text-butter-deep"
                strokeWidth={3}
              />
            </motion.span>
          </h1>

          <motion.p
            {...line(0.34)}
            className="mt-7 max-w-md text-lg leading-relaxed text-sub"
          >
            {COPY.hero.sub}
          </motion.p>

          <motion.div {...line(0.46)} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#chat"
              className="inline-flex items-center gap-2 rounded-full bg-butter px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-butter/90"
            >
              {COPY.hero.ctaPrimary}
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm text-ink transition-colors hover:border-butter/60"
            >
              {COPY.hero.ctaSecondary}
            </a>
          </motion.div>

          <motion.p {...line(0.58)} className="mt-6 text-sm text-sub">
            <span className="font-hand text-xl text-sub">{COPY.hero.resumeJoke}</span>{" "}
            <a
              href={LINKS.resume}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sage underline underline-offset-4 hover:text-butter-deep"
            >
              <FileText className="h-3.5 w-3.5" />
              {COPY.hero.resumeLabel}
            </a>
          </motion.p>
        </div>

        {/* paper collage catching the light */}
        <motion.div
          style={{ y: collageY }}
          className="relative mx-auto w-full max-w-[300px] md:col-span-5"
        >
          <StickyNote color="butter" rotate={-4} delay={0.5} className="relative z-10 w-52">
            <ul className="font-hand text-2xl leading-snug">
              {COPY.hero.marquee.map((step) =>
                step === "ship" ? (
                  <li key={step} className="relative w-fit">
                    {step}
                    <Doodle
                      kind="circle"
                      delay={1.5}
                      className="pointer-events-none absolute -inset-x-3 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+1.5rem)] text-clay"
                      strokeWidth={2.5}
                    />
                  </li>
                ) : (
                  <li key={step}>{step}</li>
                ),
              )}
            </ul>
          </StickyNote>
          <PolaroidFrame
            caption="bangalore, golden hour"
            rotate={5}
            className="absolute -right-4 top-24 w-44 sm:-right-10"
          />
        </motion.div>
      </div>

      {/* looping build strip */}
      <div className="relative border-y border-line/60 py-3">
        <Marquee
          items={COPY.hero.marquee}
          className="font-mono text-sm text-sub"
        />
      </div>
    </section>
  );
}
