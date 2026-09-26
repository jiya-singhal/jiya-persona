"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/content/profile";
import { Doodle } from "@/components/primitives/Doodle";

/** A floating pill header: a card sticker hovering just below the top edge. */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      <div className="sticker mx-auto flex w-full max-w-shell items-center justify-between rounded-full bg-card/95 py-2 pl-5 pr-2 backdrop-blur">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-display text-xl font-bold italic lowercase text-ink transition-colors hover:text-berry"
        >
          <Doodle shape="moon" color="butter" size={22} rotate={-15} />
          {COPY.nav.brand}
        </Link>
        <nav className="flex items-center gap-1">
          {COPY.nav.items.map(({ label, href }) => {
            const active = !href.includes("#") && pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`hidden rounded-full px-3 py-1.5 text-sm font-bold transition-colors sm:inline ${
                  active ? "bg-mint text-on-pastel" : "text-ink-muted hover:bg-paper-alt hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link href="/chat" className="btn btn-cta ml-2">
            {COPY.nav.cta}
          </Link>
        </nav>
      </div>
    </header>
  );
}
