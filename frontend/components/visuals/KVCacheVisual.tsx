"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { EASE, viewportOnce } from "@/lib/motion";

/*
 * Three nodes, keys travelling through consistent hashing. The key dot
 * loops slowly node to node; paused off-screen; static under reduced motion.
 */

const NODES = [
  { x: 90, y: 60, label: "NODE 01" },
  { x: 270, y: 60, label: "NODE 02" },
  { x: 450, y: 60, label: "NODE 03" },
];

export function KVCacheVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const animateKeys = inView && !reduced;

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 540 140"
      fill="none"
      className="w-full"
      role="img"
      aria-label="Three cache nodes with keys routed between them by consistent hashing"
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.3 } } }}
    >
      {/* the hash ring, flattened into a line through the nodes */}
      <motion.line
        x1={40}
        y1={60}
        x2={500}
        y2={60}
        stroke="rgb(var(--line))"
        strokeWidth={1}
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1, transition: { duration: 1.1, ease: EASE } },
        }}
      />
      {NODES.map((n) => (
        <motion.g
          key={n.label}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
          }}
        >
          <rect
            x={n.x - 42}
            y={n.y - 22}
            width={84}
            height={44}
            rx={8}
            fill="rgb(var(--panel))"
            stroke="rgb(var(--accent))"
            strokeOpacity={0.4}
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fill="rgb(var(--ivory))"
            fontSize={11}
            fontFamily="var(--font-jetbrains), monospace"
            letterSpacing="0.14em"
          >
            {n.label}
          </text>
        </motion.g>
      ))}

      {/* a key travelling the ring (transform-based — SVG-attr safe) */}
      <motion.g
        initial={false}
        animate={
          animateKeys
            ? { x: [40, 90, 90, 270, 270, 450, 450, 500], opacity: [0, 1, 1, 1, 1, 1, 1, 0] }
            : { x: 270, opacity: reduced ? 0.8 : 0 }
        }
        transition={
          animateKeys
            ? { duration: 7, times: [0, 0.15, 0.25, 0.45, 0.55, 0.75, 0.85, 1], repeat: Infinity, ease: "linear" }
            : { duration: 0 }
        }
      >
        <circle r={4} cx={0} cy={60} fill="rgb(var(--accent-bright))" />
      </motion.g>

      {/* replica write: primary → replica pulse under node 1→2 */}
      <motion.line
        x1={90}
        y1={92}
        x2={270}
        y2={92}
        stroke="rgb(var(--good))"
        strokeOpacity={0.5}
        strokeWidth={1}
        strokeDasharray="3 5"
        animate={animateKeys ? { strokeDashoffset: [0, -32] } : {}}
        transition={animateKeys ? { duration: 2.5, repeat: Infinity, ease: "linear" } : {}}
      />
      <text
        x={180}
        y={108}
        textAnchor="middle"
        fill="rgb(var(--mist))"
        fillOpacity={0.8}
        fontSize={9.5}
        fontFamily="var(--font-jetbrains), monospace"
        letterSpacing="0.08em"
      >
        sync replication
      </text>
    </motion.svg>
  );
}
