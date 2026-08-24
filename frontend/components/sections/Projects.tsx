"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { GitHubIcon } from "../icons";
import { Section } from "./Section";
import { COPY, WORK_CARDS } from "@/content/profile";
import projectsData from "@/content/projects.json";

type Project = {
  name: string;
  url: string;
  featured: boolean;
  tagline: string;
  problem: string;
  architecture: string;
  features: string[];
  tradeoffs: string[];
  demonstrates: string;
  complexity: string;
  languages: string[];
  frameworks: string[];
};

const byName = new Map(
  (projectsData as { projects: Project[] }).projects.map((p) => [p.name, p]),
);

function Chips({ items }: { items: string[] }) {
  const seen = new Set<string>();
  const unique = items.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (!unique.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {unique.map((s) => (
        <span
          key={s}
          className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-sub"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function ProjectCard({
  index,
  display,
  oneLiner,
  project,
  offset,
}: {
  index: string;
  display: string;
  oneLiner: string;
  project?: Project;
  offset: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className={`border-t border-line pt-6 ${offset ? "md:mt-12" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-sm text-sub/60">{index}</span>
          <a
            href={project?.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="group mt-1 flex items-center gap-2"
          >
            <h3 className="font-display text-3xl text-ink transition-colors group-hover:text-butter-deep">
              {display}
            </h3>
            <GitHubIcon className="h-4 w-4 text-sub transition-colors group-hover:text-butter-deep" />
          </a>
        </div>
        {project?.complexity ? (
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-sage">
            {project.complexity}
          </span>
        ) : null}
      </div>

      <p className="mt-3 max-w-md text-lg leading-relaxed text-sub">{oneLiner}</p>

      {project ? (
        <>
          <div className="mt-4">
            <Chips items={[...project.languages, ...project.frameworks].slice(0, 6)} />
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-sage underline-offset-4 hover:underline"
          >
            {open ? "less" : "architecture & honest tradeoffs"}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4 border-l border-line pl-5 text-sm leading-relaxed">
                  {project.architecture ? (
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-sub">
                        architecture
                      </div>
                      <p className="text-ink/80">{project.architecture}</p>
                    </div>
                  ) : null}
                  {project.tradeoffs.length ? (
                    <div>
                      <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-sub">
                        tradeoffs - auto-extracted from the code, kept honest
                      </div>
                      <ul className="list-disc space-y-1 pl-5 text-sub">
                        {project.tradeoffs.map((t) => (
                          <li key={t.slice(0, 32)}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {project.demonstrates ? (
                    <p className="italic text-sage">{project.demonstrates}</p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </article>
  );
}

export function Projects() {
  return (
    <Section id="projects" eyebrow={COPY.projects.eyebrow} title={COPY.projects.title}>
      <p className="-mt-4 mb-10 max-w-prose text-[15px] leading-relaxed text-sub">
        {COPY.projects.sub}
      </p>

      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {WORK_CARDS.map((card, i) => (
          <ProjectCard
            key={card.repo}
            index={`0${i + 1}`}
            display={card.display}
            oneLiner={card.oneLiner}
            project={byName.get(card.repo)}
            offset={i === 1}
          />
        ))}
      </div>

      <div className="mt-14 text-right">
        <p className="text-[15px] text-sub">{COPY.projects.outro}</p>
        <Link
          href="/archive"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-sage underline-offset-4 hover:underline"
        >
          {COPY.projects.archiveCta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
