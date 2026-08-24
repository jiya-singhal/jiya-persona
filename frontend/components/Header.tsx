"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Work", href: "/#work" },
  { label: "Projects", href: "/#projects" },
  { label: "Notes", href: "/#notes" },
  { label: "About", href: "/#about" },
  { label: "Archive", href: "/archive" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-base/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-shell items-center justify-between px-6 py-4">
        <Link href="/" className="group inline-flex items-baseline gap-1">
          <span className="font-display text-xl lowercase text-ink group-hover:text-butter-deep transition-colors">
            jiya
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-butter" aria-hidden="true" />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          {NAV.map(({ label, href }) => {
            const active = href === "/archive" && pathname === "/archive";
            return (
              <Link
                key={label}
                href={href}
                className={`bg-gradient-to-r from-butter-deep to-butter-deep bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 text-[10px] uppercase tracking-[0.18em] transition-all duration-200 hover:bg-[length:100%_1.5px] sm:text-[11px] ${
                  active ? "text-ink bg-[length:100%_1.5px]" : "text-sub hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
