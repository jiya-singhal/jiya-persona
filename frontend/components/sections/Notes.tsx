"use client";

import { Section } from "./Section";
import { Annotation } from "../doodles/Annotation";
import { Doodle } from "../doodles/Doodle";
import { StickyNote } from "../doodles/StickyNote";
import { COPY, NOTES } from "@/content/profile";

const ROTATIONS = [-2, 1.5, -1, 2];

export function Notes() {
  return (
    <Section
      id="notes"
      eyebrow={COPY.notes.eyebrow}
      title={COPY.notes.title}
      titleAccent={
        <>
          <Doodle
            kind="star"
            delay={0.4}
            className="ml-3 inline-block h-7 w-7 align-top text-butter-deep"
            strokeWidth={2.5}
          />
          <Annotation rotate={2} delay={0.5} className="ml-4 align-middle text-sub">
            {COPY.notes.annotation}
          </Annotation>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {NOTES.map((note, i) => (
          <StickyNote
            key={note.title}
            color={note.color}
            rotate={ROTATIONS[i % ROTATIONS.length]}
            delay={i * 0.08}
            className={`min-h-[10rem] ${i % 2 === 1 ? "lg:mt-8" : ""}`}
          >
            <span className="font-hand text-2xl leading-snug">{note.title}</span>
          </StickyNote>
        ))}
      </div>
    </Section>
  );
}
