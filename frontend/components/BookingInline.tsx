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

export function BookingInline({ tool }: { tool: ToolCallEvent }) {
  if (tool.name === "get_availability") {
    const slots = (tool.result?.slots as string[]) ?? [];
    return (
      <div className="mt-3 rounded-lg border border-rule bg-white p-3">
        <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
          Pulled from Jiya's calendar
        </div>
        {slots.length === 0 ? (
          <div className="text-sm text-muted">No slots available in that window.</div>
        ) : (
          <ul className="space-y-1">
            {slots.map((s) => (
              <li key={s} className="text-sm font-mono text-ink/80">
                {fmtSlot(s)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (tool.name === "book_meeting") {
    const r = tool.result as Record<string, unknown>;
    if (r?.success) {
      return (
        <div className="mt-3 rounded-lg border border-clay/30 bg-clay/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-clay mb-2">
            Meeting booked
          </div>
          <div className="text-sm text-ink/85 space-y-1">
            <div>
              <span className="text-muted">When: </span>
              {r.start ? fmtSlot(String(r.start)) : "?"}
            </div>
            {r.meeting_url ? (
              <div>
                <span className="text-muted">Meet: </span>
                <a
                  href={String(r.meeting_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-clay underline-offset-2 hover:underline"
                >
                  {String(r.meeting_url)}
                </a>
              </div>
            ) : null}
            {r.confirmation_url ? (
              <div>
                <span className="text-muted">Confirmation: </span>
                <a
                  href={String(r.confirmation_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-clay underline-offset-2 hover:underline"
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
      <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
        Booking failed: {String(r?.error ?? "unknown error")}
      </div>
    );
  }

  return null;
}
