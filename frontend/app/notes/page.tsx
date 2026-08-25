import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { NOTES } from "@/content/profile";

export const metadata: Metadata = {
  title: "Jiya Singhal · notes",
  description: "Half-finished thoughts, kept honest.",
};

export default function NotesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-shell px-6 pb-24 pt-16">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
          half-finished thoughts
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium text-ivory sm:text-5xl">
          Things I&apos;m figuring out.
        </h1>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-mist">
          Titles first, essays later. If one of these looks interesting, ask my AI
          persona about it, or ask me directly.
        </p>

        <ol className="mt-12 max-w-prose border-t border-line">
          {NOTES.map((n, i) => (
            <li
              key={n.title}
              className="flex items-baseline gap-5 border-b border-line py-5"
            >
              <span className="font-mono text-sm text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg text-ivory">{n.title}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.16em] text-mist transition-colors hover:text-accent"
          >
            ← back home
          </Link>
        </div>
      </main>
    </>
  );
}
