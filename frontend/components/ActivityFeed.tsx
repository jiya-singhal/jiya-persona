"use client";

import { useEffect, useState } from "react";
import { GitCommitHorizontal } from "lucide-react";
import { LINKS } from "@/content/profile";

type FeedItem = {
  repo: string;
  message: string;
  sha: string;
  url: string;
  at: string;
};

function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return `${Math.floor(s / 2592000)}mo ago`;
}

export function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[] | null>(null);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h2 className="inline-flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-[0.14em] text-fern">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-80" />
          <span className="relative inline-flex h-2 w-2 rounded-full border border-outline bg-mint" />
        </span>
        recently pushed - live from GitHub
      </h2>

      {items === null ? (
        <div className="mt-5 font-mono text-sm text-ink-muted">reading the commit stream…</div>
      ) : items.length === 0 ? (
        <div className="mt-5 font-mono text-sm text-ink-muted">
          Feed unavailable right now -{" "}
          <a className="link-wavy" href={LINKS.github}>
            see everything on GitHub
          </a>
          .
        </div>
      ) : (
        <ol className="sticker mt-5 divide-y-1.5 divide-dashed divide-outline/30 overflow-hidden rounded-[20px] bg-card">
          {items.map((it, i) => (
            <li key={`${it.url}-${i}`}>
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-paper-alt"
              >
                <GitCommitHorizontal className="h-4 w-4 shrink-0 text-berry" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{it.message}</span>
                  <span className="mt-0.5 block font-mono text-xs text-ink-muted">
                    {it.repo} · {it.sha}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-ink-faint">{ago(it.at)}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
