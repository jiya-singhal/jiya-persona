"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/content/profile";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-night/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-shell items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-[0.28em] text-ivory transition-colors hover:text-accent"
        >
          {COPY.nav.brand}
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          {COPY.nav.items.map(({ label, href }) => {
            const active = !href.includes("#") && pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`hidden pb-0.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors sm:inline ${
                  active ? "text-ivory" : "text-mist hover:text-ivory"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/chat"
            className="rounded-full border border-accent/40 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            {COPY.nav.cta}
          </Link>
        </nav>
      </div>
    </header>
  );
}
