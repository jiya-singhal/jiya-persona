"use client";

import type { CaseStudy as CaseStudyT } from "@/content/profile";
import { CASE_STUDIES, COPY } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";
import { PipelineDiagram } from "@/components/visuals/PipelineDiagram";
import { KVCacheVisual } from "@/components/visuals/KVCacheVisual";
import { ConversationVisual } from "@/components/visuals/ConversationVisual";
import { VoicequalDemo } from "@/components/visuals/VoicequalDemo";

const VISUALS: Record<CaseStudyT["id"], React.ComponentType> = {
  "voice-pipeline": PipelineDiagram,
  voicequal: VoicequalDemo,
  "ai-persona": ConversationVisual,
  "kv-cache": KVCacheVisual,
};

export function SelectedWork() {
  return (
    <section id="work" className="relative">
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <SectionHeading
          number={COPY.work.number}
          eyebrow={COPY.work.eyebrow}
          title={COPY.work.title}
        />
        <div className="space-y-24">
          {CASE_STUDIES.map((cs, i) => (
            <CaseStudyCard key={cs.id} cs={cs} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyCard({ cs, index }: { cs: CaseStudyT; index: number }) {
  const Visual = VISUALS[cs.id];
  const flip = index % 2 === 1;

  return (
    <Reveal>
      <article className="group grid items-start gap-10 lg:grid-cols-2">
        {/* words */}
        <div className={flip ? "lg:order-2" : ""}>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-mist">
            {cs.eyebrow}
          </p>
          <h3 className="mt-3 font-serif text-2xl font-medium leading-snug text-ivory sm:text-3xl">
            {cs.headline}
          </h3>

          {cs.metric && (
            <div className="mt-6 flex items-baseline gap-4 font-mono">
              <span className="text-2xl text-mist line-through decoration-poor/60 sm:text-3xl">
                {cs.metric.from}
              </span>
              <span className="text-accent" aria-hidden="true">
                →
              </span>
              <span className="text-3xl text-ivory sm:text-4xl">{cs.metric.to}</span>
              <span className="ml-2 text-xs uppercase tracking-[0.14em] text-good">
                {cs.metric.delta}
              </span>
            </div>
          )}

          <dl className="mt-8 space-y-5 text-[15px] leading-relaxed">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Problem
              </dt>
              <dd className="mt-1.5 text-mist">{cs.problem}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Investigation
              </dt>
              <dd className="mt-1.5 text-mist">{cs.investigation}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Built
              </dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {cs.built.map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-line bg-panel px-2.5 py-1 font-mono text-xs text-ivory"
                  >
                    {b}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Result
              </dt>
              <dd className="mt-1.5 text-ivory">{cs.result}</dd>
            </div>
          </dl>

          {/* another layer of technical information, revealed on hover/focus */}
          <div
            tabIndex={0}
            className="mt-6 max-h-0 overflow-hidden rounded-lg border border-transparent text-sm leading-relaxed text-mist opacity-0 transition-all duration-500 ease-out group-hover:max-h-48 group-hover:border-line group-hover:opacity-100 focus:max-h-48 focus:border-line focus:opacity-100"
          >
            <p className="p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver">
                deeper ·{" "}
              </span>
              {cs.hoverDetail}
            </p>
          </div>

          {cs.links && (
            <div className="mt-5 flex gap-5">
              {cs.links.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs uppercase tracking-[0.16em] text-accent underline-offset-4 transition-colors hover:text-accent-bright hover:underline"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>

        {/* visual */}
        <div
          className={`rounded-xl border border-line bg-deep/60 p-6 shadow-panel sm:p-8 ${
            flip ? "lg:order-1" : ""
          }`}
        >
          <Visual />
        </div>
      </article>
    </Reveal>
  );
}
