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
        className="max-w-[85%] rounded-[20px] rounded-bl-[4px] border-1.5 border-outline bg-sky px-4 py-3 text-on-pastel"
      >
        <p className="font-hand text-lg leading-none">you</p>
        <p className="mt-1 text-sm font-medium leading-relaxed">
          What was the hardest engineering problem Jiya solved?
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
        }}
        className="ml-auto max-w-[85%] rounded-[20px] rounded-br-[4px] border-1.5 border-outline bg-card px-4 py-3 shadow-sticker"
      >
        <p className="font-hand text-lg leading-none text-grape">jiya ai ✦</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-ink">
          Probably the cross-platform mic failure: four plausible causes, each ruled
          out with source-level proof…{" "}
          <span className="text-ink-muted">(grounded in her resume · sources cited)</span>
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
        }}
        className="flex flex-wrap gap-2 pt-2"
      >
        {TAGS.map((t, i) => (
          <span
            key={t}
            className={`rounded-full border-1.5 border-outline px-3 py-1 text-xs font-bold text-on-pastel ${
              ["bg-blush", "bg-butter", "bg-mint", "bg-sky", "bg-lilac"][i % 5]
            }`}
          >
            {t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
