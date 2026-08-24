"use client";

import type { ToolCallEvent } from "@/lib/api";

function fmtSlot(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function BookingInline({
  tool,
  onPickSlot,
}: {
  tool: ToolCallEvent;
  onPickSlot?: (text: string) => void;
}) {
  if (tool.name === "get_availability") {
    const slots = (tool.result?.slots as string[]) ?? [];
    return (
      <div className="mt-3 rounded-lg border border-line bg-card p-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-sub mb-2">
          Pulled from Jiya&apos;s calendar
        </div>
        {slots.length === 0 ? (
          <div className="text-sm text-sub">No slots available in that window.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => onPickSlot?.(`I'd like the ${fmtSlot(s)} slot.`)}
                disabled={!onPickSlot}
                className="rounded-md border border-line px-3 py-1.5 text-sm font-mono text-ink/85 transition-colors hover:border-butter hover:text-butter-deep disabled:cursor-default"
              >
                {fmtSlot(s)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tool.name === "book_meeting") {
    const r = tool.result as Record<string, unknown>;
    if (r?.success) {
      return (
        <div className="mt-3 rounded-lg border border-sage/50 bg-sage-soft/40 p-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-sage mb-2">
            Meeting booked
          </div>
          <div className="text-sm text-ink/90 space-y-1">
            <div>
              <span className="text-sub">When: </span>
              {r.start ? fmtSlot(String(r.start)) : "?"}
            </div>
            {r.meeting_url ? (
              <div>
                <span className="text-sub">Meet: </span>
                <a
                  href={String(r.meeting_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-butter-deep underline-offset-2 hover:underline"
                >
                  {String(r.meeting_url)}
                </a>
              </div>
            ) : null}
            {r.confirmation_url ? (
              <div>
                <span className="text-sub">Confirmation: </span>
                <a
                  href={String(r.confirmation_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-butter-deep underline-offset-2 hover:underline"
                >
                  view in Cal.com
                </a>
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    return (
      <div className="mt-3 rounded-lg border border-clay/60 bg-clay-soft/40 p-3 text-sm text-ink/90">
        Booking failed: {String(r?.error ?? "unknown error")}
      </div>
    );
  }

  return null;
}
