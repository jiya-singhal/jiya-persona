"use client";

import { motion } from "framer-motion";
import { EASE, viewportOnce } from "@/lib/motion";

/*
 * The 57s → 15s story, drawn: audio → VAD → concurrent tasks → processing
 * → ready. Lines draw themselves; nodes illuminate in sequence; the three
 * concurrent branches light up together — that's the whole point.
 */

const STAGES = ["audio", "VAD", "concurrent", "processing", "ready"];

export function PipelineDiagram() {
  const y = 70;
  const xs = [30, 130, 250, 380, 490];
  const branchYs = [30, 70, 110];

  return (
    <motion.svg
      viewBox="0 0 540 140"
      fill="none"
      className="w-full"
      role="img"
      aria-label="Pipeline diagram: audio flows through voice-activity detection into three concurrent tasks, then processing, then ready"
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.4 } } }}
    >
      {/* audio → VAD */}
      <Edge x1={xs[0]} y1={y} x2={xs[1]} y2={y} />
      {/* VAD fans out to three concurrent branches */}
      {branchYs.map((by) => (
        <Edge key={`f${by}`} x1={xs[1]} y1={y} x2={xs[2]} y2={by} />
      ))}
      {/* branches merge into processing */}
      {branchYs.map((by) => (
        <Edge key={`m${by}`} x1={xs[2]} y1={by} x2={xs[3]} y2={y} />
      ))}
      {/* processing → ready */}
      <Edge x1={xs[3]} y1={y} x2={xs[4]} y2={y} />

      {/* nodes */}
      <Node x={xs[0]} y={y} label={STAGES[0]} />
      <Node x={xs[1]} y={y} label={STAGES[1]} />
      {branchYs.map((by, i) => (
        <Node key={`b${by}`} x={xs[2]} y={by} label={i === 1 ? "tasks ×3" : ""} small />
      ))}
      <Node x={xs[3]} y={y} label={STAGES[3]} />
      <Node x={xs[4]} y={y} label={STAGES[4]} accent />
    </motion.svg>
  );
}

function Edge(props: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <motion.line
      {...props}
      stroke="rgb(var(--accent))"
      strokeOpacity={0.35}
      strokeWidth={1}
      variants={{
        hidden: { pathLength: 0, opacity: 0 },
        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.9, ease: EASE } },
      }}
    />
  );
}

function Node({
  x,
  y,
  label,
  small = false,
  accent = false,
}: {
  x: number;
  y: number;
  label: string;
  small?: boolean;
  accent?: boolean;
}) {
  return (
    <motion.g
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.7, ease: EASE } },
      }}
    >
      <circle
        cx={x}
        cy={y}
        r={small ? 4 : 6}
        fill={accent ? "rgb(var(--good))" : "rgb(var(--accent))"}
        fillOpacity={accent ? 1 : 0.9}
      />
      <circle cx={x} cy={y} r={small ? 9 : 12} fill="rgb(var(--accent))" fillOpacity={0.1} />
      {label && (
        <text
          x={x}
          y={y + (small ? 26 : 30)}
          textAnchor="middle"
          fill="rgb(var(--mist))"
          fontSize={11}
          fontFamily="var(--font-jetbrains), monospace"
          letterSpacing="0.06em"
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}
