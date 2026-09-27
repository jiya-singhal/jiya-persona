"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/content/profile";
import { Motif } from "@/components/primitives/Motif";
import { useTwoAM } from "@/components/eggs/useTwoAM";

/** A floating pill header: a card sticker hovering just below the top edge. */
export function Header() {
  const pathname = usePathname();
  const { toggle, isTwoAM } = useTwoAM();

  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      <div className="sticker mx-auto flex w-full max-w-shell items-center justify-between rounded-full bg-card/95 py-2 pl-5 pr-2 backdrop-blur">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-xl font-bold lowercase text-ink transition-colors hover:text-berry"
        >
          <Motif name="waveform" bare size={22} className="text-berry" />
          {COPY.nav.brand}
        </Link>
        <nav className="flex items-center gap-1">
          {COPY.nav.items.map(({ label, href }) => {
            const active = !href.includes("#") && pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`hidden rounded-full px-3 py-1.5 text-sm font-bold transition-colors md:inline ${
                  active ? "bg-mint text-on-pastel" : "text-ink-muted hover:bg-paper-alt hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          {/* 2 AM mode: the night theme, as a plain switch */}
          <button
            type="button"
            onClick={toggle}
            aria-pressed={isTwoAM}
            className="ml-1 inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 font-mono text-xs text-ink-muted transition-colors hover:bg-paper-alt hover:text-ink"
          >
            <span
              aria-hidden="true"
              className={`relative h-4 w-7 rounded-full border-1.5 border-outline transition-colors ${
                isTwoAM ? "bg-lilac" : "bg-paper-alt"
              }`}
            >
              <span
                className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-outline transition-[left] ${
                  isTwoAM ? "left-[13px]" : "left-[2px]"
                }`}
              />
            </span>
            <span className="hidden sm:inline">2 AM</span>
          </button>
          <Link href="/chat" className="btn btn-cta ml-1">
            {COPY.nav.cta}
          </Link>
        </nav>
      </div>
    </header>
  );
}
