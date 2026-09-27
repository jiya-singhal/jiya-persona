import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Motif } from "@/components/primitives/Motif";
import { Highlight } from "@/components/primitives/Highlight";
import projectsData from "@/content/projects.json";

export const metadata: Metadata = {
  title: "Jiya Singhal · experiments",
  description: "Everything public, honestly summarized: the full project index.",
};

type Project = {
  name: string;
  url: string;
  tagline: string;
  languages: string[];
};

const projects = (projectsData as { projects: Project[] }).projects;

export default function ArchivePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-shell px-6 pb-24 pt-16">
        <p className="font-mono text-sm font-medium uppercase tracking-[0.16em] text-berry">the full index</p>
        <h1 className="mt-3 inline-flex items-center gap-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
          <Highlight color="blush">Experiments.</Highlight>
          <Motif name="braces" color="butter" size={44} />
        </h1>
        <p className="mt-4 max-w-prose text-base font-medium leading-relaxed text-ink-muted">
          The complete works, including the early questionable ones. Each entry
          is auto-generated from the repo&apos;s actual source by the same pipeline
          that feeds my AI persona, tradeoffs included.
        </p>

        <ol className="mt-12 grid gap-4">
          {projects.map((p, i) => (
            <li key={p.name}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="sticker group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 rounded-[20px] bg-card px-5 py-4 transition-transform duration-200 ease-bounce hover:-translate-y-0.5 md:grid-cols-[3rem_16rem_1fr_auto]"
              >
                <span
                  className={`inline-grid h-8 w-8 place-items-center self-center rounded-full border-1.5 border-outline font-mono text-xs text-on-pastel ${
                    ["bg-blush", "bg-butter", "bg-mint", "bg-sky", "bg-lilac", "bg-peach"][i % 6]
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="font-display text-xl font-semibold text-ink transition-colors group-hover:text-berry">
                    {p.name}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-berry opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="col-span-3 line-clamp-2 text-sm text-ink-muted md:col-span-1">
                  {p.tagline}
                </span>
                {p.languages[0] ? (
                  <span className="hidden rounded-full border-1.5 border-outline bg-mint px-2.5 py-0.5 font-mono text-[11px] text-on-pastel md:inline">
                    {p.languages[0]}
                  </span>
                ) : (
                  <span className="hidden md:inline" />
                )}
              </a>
            </li>
          ))}
        </ol>

        <div className="mt-16">
          <ActivityFeed />
        </div>

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
