"use client";

import Link from "next/link";
import { COPY, LINKS } from "@/content/profile";
import { useTwoAM } from "@/components/eggs/useTwoAM";
import { Constellation } from "@/components/primitives/Constellation";
import { Reveal } from "@/components/primitives/Reveal";
import { Doodle } from "@/components/primitives/Doodle";
import { Highlight } from "@/components/primitives/Highlight";

const LINK_COLORS = ["bg-blush", "bg-butter", "bg-mint", "bg-sky", "bg-lilac", "bg-peach"];

export function Footer() {
  const { toggle } = useTwoAM();

  return (
    <footer id="contact" className="relative overflow-hidden">
      <Constellation className="pointer-events-none absolute -bottom-10 left-1/2 w-[30rem] -translate-x-1/2 opacity-40" />
      <Doodle shape="sparkle" color="butter" size={30} rotate={-12} className="absolute left-[10%] top-24 hidden md:block" />
      <Doodle shape="heart" color="blush" size={26} rotate={10} className="absolute right-[12%] top-40 hidden md:block" />
      <Doodle shape="flower" color="mint" size={30} className="absolute bottom-24 left-[16%] hidden md:block" />

      <div className="relative mx-auto w-full max-w-shell px-6 py-24 text-center">
        <button
          type="button"
          onClick={toggle}
          aria-label="The moon again. It still works."
          className="mx-auto block rounded-full transition-transform duration-300 ease-bounce hover:-rotate-12 hover:scale-110"
        >
          <Doodle shape="moon" color="butter" size={48} rotate={-18} />
        </button>

        <Reveal>
          <p className="mt-8 font-display text-3xl font-semibold italic text-ink sm:text-5xl">
            {COPY.footer.still}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-prose text-lg font-medium text-ink-muted">
            {COPY.footer.fields}{" "}
            <Highlight color="mint">{COPY.footer.listening}</Highlight>
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <Link href="/chat" className="btn btn-primary mt-8">
            {COPY.footer.ask} ✦
          </Link>
          <p className="mt-4 font-hand text-xl text-grape">{COPY.footer.askAside}</p>
        </Reveal>

        <p className="mt-14 text-sm font-medium text-ink-muted">
          {COPY.footer.resumePrefix}{" "}
          <a href={LINKS.resume} className="link-wavy">
            {COPY.footer.resumeCta}
          </a>
        </p>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "GitHub", href: LINKS.github },
            { label: "LinkedIn", href: LINKS.linkedin },
            { label: "PyPI", href: LINKS.pypi },
            { label: "LeetCode", href: LINKS.leetcode },
            { label: "Email", href: LINKS.email },
            { label: "Resume", href: LINKS.resume },
          ].map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={`rounded-full border-1.5 border-outline px-4 py-1.5 text-sm font-bold text-on-pastel transition-transform duration-200 ease-bounce hover:-translate-y-0.5 hover:-rotate-2 ${LINK_COLORS[i % LINK_COLORS.length]}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <p className="mt-10 font-mono text-[11px] tracking-[0.12em] text-ink-faint">
          © {new Date().getFullYear()} jiya singhal · built at night, measured by day ✦
        </p>
      </div>
    </footer>
  );
}
