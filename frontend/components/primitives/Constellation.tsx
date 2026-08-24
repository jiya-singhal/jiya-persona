"use client";

import { motion } from "framer-motion";
import { EASE, viewportOnce } from "@/lib/motion";

/*
 * The signature motif: from far away, a constellation; up close, a system
 * diagram. Tiny labeled nodes joined by hairlines, illuminating in sequence.
 */

type Node = { x: number; y: number; label: string; r?: number };

const NODES: Node[] = [
  { x: 40, y: 150, label: "client", r: 3 },
  { x: 150, y: 60, label: "api", r: 3.5 },
  { x: 290, y: 110, label: "queue", r: 3 },
  { x: 420, y: 40, label: "worker", r: 3.5 },
  { x: 520, y: 150, label: "model", r: 4 },
  { x: 400, y: 220, label: "db", r: 3 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [1, 5],
];

export function Constellation({
  className,
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <motion.svg
      viewBox="0 0 560 260"
      fill="none"
      className={className}
      aria-hidden="true"
      initial={animate ? "hidden" : "visible"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.25 } } }}
    >
      {EDGES.map(([a, b], i) => (
        <motion.line
          key={`e${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="rgb(var(--accent))"
          strokeOpacity={0.25}
          strokeWidth={0.75}
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 1.1, ease: EASE },
            },
          }}
        />
      ))}
      {NODES.map((n, i) => (
        <motion.g
          key={`n${i}`}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
          }}
        >
          <circle cx={n.x} cy={n.y} r={n.r ?? 3} fill="rgb(var(--accent))" fillOpacity={0.9} />
          <circle cx={n.x} cy={n.y} r={(n.r ?? 3) + 5} fill="rgb(var(--accent))" fillOpacity={0.12} />
          <text
            x={n.x + 10}
            y={n.y + 3}
            fill="rgb(var(--mist))"
            fillOpacity={0.7}
            fontSize={9}
            fontFamily="var(--font-jetbrains), monospace"
            letterSpacing="0.08em"
          >
            {n.label}
          </text>
        </motion.g>
      ))}
    </motion.svg>
  );
}
