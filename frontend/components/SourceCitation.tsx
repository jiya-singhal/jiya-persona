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

export function SourceCitation({ sources }: { sources: Source[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!sources.length) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="font-mono text-[11px] uppercase tracking-wider text-mist">
        Sources
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <button
            key={i}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className={`px-2 py-1 rounded-md text-xs border transition-colors ${
              openIdx === i
                ? "bg-gold text-stage border-gold"
                : "bg-curtain text-ivory/80 border-veil hover:border-gold/50"
            }`}
          >
            <span className="font-mono mr-1.5 opacity-60">{i + 1}</span>
            {tagOf(s)}
          </button>
        ))}
      </div>
      {openIdx !== null && (
        <div className="mt-1 rounded-md border border-veil bg-curtain p-3 text-sm leading-relaxed text-ivory/80 whitespace-pre-wrap">
          {sources[openIdx].text}
        </div>
      )}
    </div>
  );
}
