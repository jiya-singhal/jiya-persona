"use client";

import { ExternalLink } from "lucide-react";
import { Section } from "./Section";
import { Annotation } from "../doodles/Annotation";
import { Doodle } from "../doodles/Doodle";
import { PolaroidFrame } from "../doodles/PolaroidFrame";
import { ABOUT, COPY } from "@/content/profile";

export function About() {
  return (
    <Section
      id="about"
      eyebrow={COPY.about.eyebrow}
      title={
        <>
          {COPY.about.title}{" "}
          <span aria-hidden="true">{COPY.about.wave}</span>
        </>
      }
    >
      <div className="grid gap-12 md:grid-cols-[3fr_2fr]">
        <div className="relative max-w-prose space-y-5 text-[17px] leading-relaxed">
          {ABOUT.body.map((p) => (
            <p key={p.slice(0, 24)} className="text-ink/85">
              {p}
            </p>
          ))}

          {/* roots: the road here */}
          <div className="border-t border-line pt-7">
            <h3 className="font-display text-2xl text-ink">{COPY.about.rootsTitle}</h3>
            <div className="mt-4 space-y-4">
              {ABOUT.roots.map((p) => (
                <p key={p.slice(0, 24)} className="text-sub">
                  {p}
                </p>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Doodle
                kind="arrow"
                delay={0.5}
                className="h-8 w-12 -scale-x-100 text-sage"
                strokeWidth={2.5}
              />
              <Annotation rotate={-2} delay={0.7} className="text-sage">
                {COPY.about.annotation}
              </Annotation>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-sub">
              Education
            </h3>
            <ul className="mt-3 space-y-3">
              {ABOUT.education.map((e) => (
                <li key={e.school} className="border-l border-line pl-4">
                  <div className="text-ink">{e.school}</div>
                  <div className="text-sm text-sub">{e.detail}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-sub">
              Open source
            </h3>
            <ul className="mt-3 space-y-2">
              {ABOUT.openSource.map((o) => (
                <li key={o.label}>
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-sage underline-offset-4 hover:underline"
                  >
                    {o.label}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-5">
            <PolaroidFrame caption="dehradun, home" rotate={-3} className="w-40" />
            <PolaroidFrame caption="bangalore, now" rotate={3} className="mt-6 w-40" />
          </div>
        </div>
      </div>
    </Section>
  );
}
