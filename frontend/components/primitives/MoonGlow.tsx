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
            "radial-gradient(700px 480px at 82% 22%, rgb(var(--accent) / 0.18), transparent 70%)",
        }}
      />
      {/* the moon itself */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isTwoAM ? "Leave 2 AM mode" : "A small moon. Click it."}
        title="☾"
        className="absolute right-[8%] top-[12%] h-14 w-14 rounded-full transition-transform duration-500 hover:scale-110 focus-visible:scale-110 sm:h-20 sm:w-20"
        style={{
          background:
            "radial-gradient(circle at 36% 34%, rgb(255 253 246 / 1), rgb(var(--ivory) / 0.85) 55%, rgb(var(--ivory) / 0.35) 80%, transparent 100%)",
          boxShadow:
            "0 0 40px 10px rgb(var(--ivory) / 0.30), 0 0 120px 40px rgb(var(--accent) / 0.18)",
        }}
      />
    </div>
  );
}
