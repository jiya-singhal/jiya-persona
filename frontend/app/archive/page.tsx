import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { ActivityFeed } from "@/components/ActivityFeed";
import projectsData from "@/content/projects.json";

export const metadata: Metadata = {
  title: "Jiya Singhal — experiments",
  description: "Everything public, honestly summarized — the full project index.",
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
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
          the full index
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium text-ivory sm:text-5xl">
          Experiments.
        </h1>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-mist">
          The complete works, including the early questionable ones. Each entry
          is auto-generated from the repo&apos;s actual source by the same pipeline
          that feeds my AI persona — tradeoffs included.
        </p>

        <ol className="mt-12 border-t border-line">
          {projects.map((p, i) => (
            <li key={p.name} className="border-b border-line">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4 md:grid-cols-[3rem_16rem_1fr_auto]"
              >
                <span className="font-mono text-sm text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="font-serif text-xl text-ivory transition-colors group-hover:text-accent">
                    {p.name}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-mist opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="col-span-3 line-clamp-2 text-sm text-mist md:col-span-1">
                  {p.tagline}
                </span>
                <span className="hidden font-mono text-[11px] text-accent md:inline">
                  {p.languages[0] ?? ""}
                </span>
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
            className="font-mono text-xs uppercase tracking-[0.16em] text-mist transition-colors hover:text-accent"
          >
            ← back home
          </Link>
        </div>
      </main>
    </>
  );
}
