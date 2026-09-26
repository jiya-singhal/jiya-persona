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
      <div className="mt-3 rounded-[14px] border-1.5 border-outline bg-sky p-3 text-on-pastel">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wider">
          ✦ Pulled from Jiya&apos;s calendar
        </div>
        {slots.length === 0 ? (
          <div className="text-sm">No slots available in that window.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => onPickSlot?.(`I'd like the ${fmtSlot(s)} slot.`)}
                disabled={!onPickSlot}
                className="rounded-full border-1.5 border-on-pastel bg-white px-3 py-1.5 font-mono text-sm text-on-pastel transition-transform duration-200 ease-bounce hover:-translate-y-0.5 hover:bg-butter disabled:cursor-default"
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
        <div className="mt-3 rounded-[14px] border-1.5 border-outline bg-mint p-3 text-on-pastel">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wider">
            ✓ Meeting booked
          </div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="opacity-75">When: </span>
              {r.start ? fmtSlot(String(r.start)) : "?"}
            </div>
            {r.meeting_url ? (
              <div>
                <span className="opacity-75">Meet: </span>
                <a
                  href={String(r.meeting_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline decoration-wavy underline-offset-4"
                >
                  {String(r.meeting_url)}
                </a>
              </div>
            ) : null}
            {r.confirmation_url ? (
              <div>
                <span className="opacity-75">Confirmation: </span>
                <a
                  href={String(r.confirmation_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline decoration-wavy underline-offset-4"
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
      <div className="mt-3 rounded-[14px] border-1.5 border-outline bg-blush p-3 text-sm text-on-pastel">
        ✕ Booking failed: {String(r?.error ?? "unknown error")}
      </div>
    );
  }

  return null;
}
