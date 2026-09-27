"use client";

import type { CaseStudy as CaseStudyT } from "@/content/profile";
import { CASE_STUDIES, COPY } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";
import { PipelineDiagram } from "@/components/visuals/PipelineDiagram";
import { KVCacheVisual } from "@/components/visuals/KVCacheVisual";
import { ConversationVisual } from "@/components/visuals/ConversationVisual";
import { VoicequalDemo } from "@/components/visuals/VoicequalDemo";
import { Highlight } from "@/components/primitives/Highlight";
import { Sticker } from "@/components/primitives/Sticker";
import { Motif, type MotifName, type Pastel } from "@/components/primitives/Motif";

/* Each case study gets a pastel and the motif of its own work. */
const MOTIFS: Record<CaseStudyT["id"], { color: Pastel; name: MotifName }> = {
  "voice-pipeline": { color: "blush", name: "waveform" },
  voicequal: { color: "mint", name: "spectrum" },
  "ai-persona": { color: "sky", name: "braces" },
  "kv-cache": { color: "lilac", name: "nodes" },
};
/* Built-with tags cycle through all six pastels, like a sheet of stickers. */
const TAG_COLORS = ["bg-blush", "bg-butter", "bg-mint", "bg-sky", "bg-lilac", "bg-peach"];

/** Marker-highlights the last word of the section title. */
function lastWordHighlighted(title: string) {
  const i = title.lastIndexOf(" ");
  return (
    <>
      {title.slice(0, i + 1)}
      <Highlight color="blush">{title.slice(i + 1)}</Highlight>
    </>
  );
}

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
          title={lastWordHighlighted(COPY.work.title)}
          color="blush"
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
  const motif = MOTIFS[cs.id];

  return (
    <Reveal>
      <article className="group grid items-start gap-10 lg:grid-cols-2">
        {/* words */}
        <div className={flip ? "lg:order-2" : ""}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
            {cs.eyebrow}
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {cs.headline}
          </h3>

          {cs.metric && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-mono text-2xl text-ink-muted line-through decoration-berry decoration-2">
                {cs.metric.from}
              </span>
              <span className="text-2xl text-berry" aria-hidden="true">
                →
              </span>
              <span className="font-display text-4xl font-bold leading-none text-ink sm:text-5xl">
                <Highlight color="butter">{cs.metric.to}</Highlight>
              </span>
              <Sticker color="mint">
                {cs.metric.delta}
              </Sticker>
            </div>
          )}

          <dl className="mt-8 space-y-5 text-base leading-relaxed">
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.16em] text-berry">problem</dt>
              <dd className="mt-1.5 text-ink-muted">{cs.problem}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.16em] text-berry">investigation</dt>
              <dd className="mt-1.5 text-ink-muted">{cs.investigation}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.16em] text-berry">built</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {cs.built.map((b, i) => (
                  <span
                    key={b}
                    className={`rounded-full border-1.5 border-outline px-3 py-1 text-[0.8125rem] font-bold text-on-pastel ${TAG_COLORS[i % TAG_COLORS.length]}`}
                  >
                    {b}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.16em] text-berry">result</dt>
              <dd className="mt-1.5 font-semibold text-ink">{cs.result}</dd>
            </div>
          </dl>

          {/* another layer of technical information, revealed on hover/focus */}
          <div
            tabIndex={0}
            className="mt-6 max-h-0 overflow-hidden rounded-[14px] border-1.5 border-dashed border-transparent bg-card text-base leading-relaxed text-ink-muted opacity-0 transition-all duration-500 ease-out group-hover:max-h-48 group-hover:border-outline group-hover:opacity-100 focus:max-h-48 focus:border-outline focus:opacity-100"
          >
            <p className="p-4">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-grape">deeper · </span>
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
                  className="link-wavy"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>

        {/* visual */}
        <div
          className={`sticker relative rounded-[20px] bg-card p-6 pt-12 sm:p-8 sm:pt-14 ${flip ? "lg:order-1" : ""}`}
        >
          <Motif name={motif.name} color={motif.color} size={36} className="absolute left-5 top-4" />
          <Visual />
        </div>
      </article>
    </Reveal>
  );
}
