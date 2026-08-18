"use client";

import { motion } from "framer-motion";
import { Section } from "./Section";
import { EXPERIENCE } from "@/content/profile";

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="Where the numbers come from">
      <div className="space-y-16">
        {EXPERIENCE.map((job) => (
          <article key={job.company} className="grid gap-6 md:grid-cols-[220px_1fr]">
            <header>
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-2xl text-ivory hover:text-gold transition-colors"
              >
                {job.company}
              </a>
              <div className="mt-1 text-sm text-mist">{job.role}</div>
              <div className="mt-2 font-mono text-xs text-gold">{job.period}</div>
              <div className="font-mono text-xs text-mist">{job.location}</div>
            </header>

            <div className="space-y-5 border-l border-veil pl-6">
              {job.bullets.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                >
                  <h3 className="text-ivory font-medium">{b.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-mist">{b.body}</p>
                </motion.div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
