"use client";

import { useTwoAM } from "@/components/eggs/useTwoAM";
import { Doodle } from "./Doodle";

/**
 * The moon: a butter moon sticker in the hero with a soft pastel glow
 * behind it, and the quiet doorway into the stargazing theme.
 */
export function MoonGlow({ className }: { className?: string }) {
  const { toggle, isTwoAM } = useTwoAM();

  return (
    <div className={className}>
      {/* soft pastel glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px 380px at 85% 20%, rgb(var(--lilac) / 0.45), transparent 70%), radial-gradient(420px 320px at 8% 90%, rgb(var(--blush) / 0.35), transparent 70%)",
        }}
      />
      {/* the moon itself */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isTwoAM ? "Back to daydream mode" : "A small moon. Click it."}
        title="☾"
        className="absolute right-[6%] top-[3%] rounded-full sm:right-[8%] sm:top-[10%] transition-transform duration-500 ease-bounce hover:-rotate-12 hover:scale-110 focus-visible:scale-110"
      >
        <Doodle shape="moon" color="butter" size={84} rotate={-18} className="h-14 w-14 sm:h-20 sm:w-20" />
      </button>
    </div>
  );
}
