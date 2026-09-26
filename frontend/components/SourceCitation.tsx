"use client";

import { useState } from "react";
import type { Source } from "@/lib/api";

function tagOf(s: Source): string {
  const m = s.metadata || {};
  const t = m.source_type;
  if (t === "resume") return `resume · ${m.section ?? "?"}`;
  if (t === "github_card") return `${m.repo ?? "?"} · ${m.field ?? "card"}`;
  if (t === "github_code") return `${m.repo ?? "?"} · ${m.file_path ?? "?"}`;
  return String(t ?? "source");
}

const CHIP = ["bg-blush", "bg-butter", "bg-mint", "bg-sky", "bg-lilac", "bg-peach"];

export function SourceCitation({ sources }: { sources: Source[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!sources.length) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
        Sources
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((s, i) => (
          <button
            key={i}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className={`rounded-full border-1.5 border-outline py-1 pl-1 pr-3 text-xs font-bold text-on-pastel transition-transform duration-200 ease-bounce hover:-translate-y-0.5 ${
              CHIP[i % CHIP.length]
            } ${openIdx === i ? "-rotate-2 shadow-sticker" : ""}`}
          >
            <span className="mr-1.5 inline-grid h-5 w-5 place-items-center rounded-full border-1.5 border-on-pastel bg-white font-mono text-[10px]">
              {i + 1}
            </span>
            {tagOf(s)}
          </button>
        ))}
      </div>
      {openIdx !== null && (
        <div className="mt-1 rounded-[14px] border-1.5 border-dashed border-outline bg-card p-3 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
          {sources[openIdx].text}
        </div>
      )}
    </div>
  );
}
