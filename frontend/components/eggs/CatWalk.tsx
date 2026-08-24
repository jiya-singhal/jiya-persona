"use client";

import { useEffect } from "react";

/**
 * A tiny black cat crosses the bottom of the screen, then leaves.
 * Inline SVG silhouette, CSS keyframes, no assets. Unmounts after ~9s.
 */
export function CatWalk({ onDone }: { onDone?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 9000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes jiya-cat-cross {
          from { transform: translateX(-80px); }
          to { transform: translateX(calc(100vw + 80px)); }
        }
        @keyframes jiya-cat-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .jiya-cat { display: none; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="jiya-cat pointer-events-none fixed bottom-2 left-0 z-[90]"
        style={{ animation: "jiya-cat-cross 8s linear forwards" }}
      >
        <svg
          width="56"
          height="32"
          viewBox="0 0 56 32"
          fill="rgb(var(--ivory))"
          opacity={0.85}
          style={{ animation: "jiya-cat-bob 0.5s ease-in-out infinite" }}
        >
          {/* body */}
          <ellipse cx="26" cy="22" rx="14" ry="7" />
          {/* head + ears */}
          <circle cx="43" cy="16" r="6" />
          <path d="M39 11 L38 5 L42 9 Z" />
          <path d="M46 10 L48 4 L50 10 Z" />
          {/* tail */}
          <path d="M12 20 C4 18 2 10 6 6 C4 12 8 16 14 18 Z" />
          {/* legs */}
          <rect x="18" y="26" width="2.5" height="6" rx="1" />
          <rect x="24" y="26" width="2.5" height="6" rx="1" />
          <rect x="31" y="26" width="2.5" height="6" rx="1" />
          <rect x="37" y="25" width="2.5" height="6" rx="1" />
        </svg>
      </div>
    </>
  );
}
