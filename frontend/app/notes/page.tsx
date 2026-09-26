import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { NOTES } from "@/content/profile";
import { Doodle } from "@/components/primitives/Doodle";
import { Highlight } from "@/components/primitives/Highlight";

export const metadata: Metadata = {
  title: "Jiya Singhal · notes",
  description: "Half-finished thoughts, kept honest.",
};

export default function NotesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-shell px-6 pb-24 pt-16">
        <p className="font-hand text-2xl text-grape">half-finished thoughts ↘</p>
        <h1 className="mt-3 inline-flex flex-wrap items-center gap-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
          <span>
            Things I&apos;m <Highlight color="lilac">figuring out.</Highlight>
          </span>
          <Doodle shape="cloud" color="sky" size={40} />
        </h1>
        <p className="mt-4 max-w-prose text-base font-medium leading-relaxed text-ink-muted">
          Titles first, essays later. If one of these looks interesting, ask my AI
          persona about it, or ask me directly.
        </p>

        <ol className="sticker mt-12 max-w-prose overflow-hidden rounded-[20px] bg-card">
          {NOTES.map((n, i) => (
            <li
              key={n.title}
              className="flex items-baseline gap-5 border-b-1.5 border-dashed border-outline/30 px-6 py-5 last:border-b-0"
            >
              <span className="font-hand text-2xl text-grape">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg font-semibold text-ink">{n.title}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <Link
            href="/"
            className="btn btn-ghost"
          >
            ← back home
          </Link>
        </div>
      </main>
    </>
  );
}
