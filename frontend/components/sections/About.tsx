"use client";

import { ExternalLink } from "lucide-react";
import { Section } from "./Section";
import { ABOUT } from "@/content/profile";

export function About() {
  return (
    <Section id="about" eyebrow="About" title="Measured before believed">
      <div className="grid gap-12 md:grid-cols-[3fr_2fr]">
        <div className="space-y-5 text-[17px] leading-relaxed text-ivory/85 max-w-prose">
          <p className="text-xl text-ivory">{ABOUT.lede}</p>
          {ABOUT.body.map((p) => (
            <p key={p.slice(0, 24)} className="text-mist">
              {p}
            </p>
          ))}
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-mono text-xs tracking-[0.22em] uppercase text-mist">
              Education
            </h3>
            <ul className="mt-3 space-y-3">
              {ABOUT.education.map((e) => (
                <li key={e.school} className="border-l border-veil pl-4">
                  <div className="text-ivory">{e.school}</div>
                  <div className="text-sm text-mist">{e.detail}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-xs tracking-[0.22em] uppercase text-mist">
              Open source
            </h3>
            <ul className="mt-3 space-y-2">
              {ABOUT.openSource.map((o) => (
                <li key={o.label}>
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline underline-offset-4"
                  >
                    {o.label}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
