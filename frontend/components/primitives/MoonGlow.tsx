"use client";

import { useTwoAM } from "@/components/eggs/useTwoAM";

/**
 * The moon: a soft radial glow behind the hero, and the quiet doorway
 * into 2 AM mode. Click it and the site gets even darker.
 */
export function MoonGlow({ className }: { className?: string }) {
  const { toggle, isTwoAM } = useTwoAM();

  return (
    <div className={className} aria-hidden={false}>
      {/* radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 400px at 70% 20%, rgb(var(--accent) / 0.10), transparent 70%)",
        }}
      />
      {/* the moon itself */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isTwoAM ? "Leave 2 AM mode" : "A small moon. Click it."}
        title="☾"
        className="absolute right-[12%] top-[14%] h-8 w-8 rounded-full transition-transform duration-500 hover:scale-110 focus-visible:scale-110"
        style={{
          background:
            "radial-gradient(circle at 38% 35%, rgb(var(--ivory) / 0.95), rgb(var(--ivory) / 0.55) 55%, rgb(var(--ivory) / 0.15) 75%, transparent 100%)",
          boxShadow: "0 0 32px 6px rgb(var(--ivory) / 0.14)",
        }}
      />
    </div>
  );
}
