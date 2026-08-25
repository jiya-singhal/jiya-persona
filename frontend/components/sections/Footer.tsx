"use client";

import Link from "next/link";
import { COPY, LINKS } from "@/content/profile";
import { useTwoAM } from "@/components/eggs/useTwoAM";
import { Constellation } from "@/components/primitives/Constellation";
import { Reveal } from "@/components/primitives/Reveal";

export function Footer() {
  const { toggle } = useTwoAM();

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-line">
      <Constellation className="pointer-events-none absolute -bottom-10 left-1/2 w-[30rem] -translate-x-1/2 opacity-25" />

      <div className="relative mx-auto w-full max-w-shell px-6 py-24 text-center">
        <button
          type="button"
          onClick={toggle}
          aria-label="The moon again. It still works."
          className="mx-auto block font-serif text-3xl text-silver transition-colors hover:text-ivory"
        >
          ☾
        </button>

        <Reveal>
          <p className="mt-8 font-serif text-3xl italic text-ivory sm:text-4xl">
            {COPY.footer.still}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-prose text-lg text-mist">
            {COPY.footer.fields}{" "}
            <span className="text-ivory">{COPY.footer.listening}</span>
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <Link
            href="/chat"
            className="mt-8 inline-block rounded-full border border-accent/40 px-6 py-3 font-mono text-sm uppercase tracking-[0.16em] text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            {COPY.footer.ask}
          </Link>
          <p className="mt-4 text-sm text-mist">{COPY.footer.askAside}</p>
        </Reveal>

        <p className="mt-14 text-sm text-mist">
          {COPY.footer.resumePrefix}{" "}
          <a
            href={LINKS.resume}
            className="text-accent underline-offset-4 transition-colors hover:text-accent-bright hover:underline"
          >
            {COPY.footer.resumeCta}
          </a>
        </p>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {[
            { label: "GitHub", href: LINKS.github },
            { label: "LinkedIn", href: LINKS.linkedin },
            { label: "PyPI", href: LINKS.pypi },
            { label: "LeetCode", href: LINKS.leetcode },
            { label: "Email", href: LINKS.email },
            { label: "Resume", href: LINKS.resume },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-faint">
          © {new Date().getFullYear()} JIYA SINGHAL · BUILT AT NIGHT, MEASURED BY DAY
        </p>
      </div>
    </footer>
  );
}
