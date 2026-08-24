"use client";

import { motion } from "framer-motion";
import { EASE, viewportOnce } from "@/lib/motion";

/*
 * The AI Persona case study opens the way it should: with a conversation.
 * Two bubbles type in once on scroll; the tags underneath name the system.
 */

const TAGS = ["Voice", "RAG", "MMR retrieval", "GitHub ingestion", "LLM evaluation"];

export function ConversationVisual() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.5 } } }}
      className="space-y-3"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
        }}
        className="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-deep px-4 py-3"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">you</p>
        <p className="mt-1 text-sm leading-relaxed text-ivory">
          What was the hardest engineering problem Jiya solved?
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
        }}
        className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-accent/30 bg-panel px-4 py-3"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">jiya ai</p>
        <p className="mt-1 text-sm leading-relaxed text-ivory">
          Probably the cross-platform mic failure — four plausible causes, each ruled
          out with source-level proof…{" "}
          <span className="text-mist">(grounded in her resume · sources cited)</span>
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
        }}
        className="flex flex-wrap gap-2 pt-2"
      >
        {TAGS.map((t) => (
          <span
            key={t}
            className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mist"
          >
            {t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
