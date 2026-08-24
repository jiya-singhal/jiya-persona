"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { COPY } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";
import { ChatWindow } from "../ChatWindow";

export function ChatSection() {
  return (
    <section id="chat" className="bg-deep">
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <SectionHeading
          number={COPY.chat.number}
          eyebrow={COPY.chat.eyebrow}
          title={COPY.chat.title}
          serif
        />
        <Reveal>
          <p className="-mt-4 mb-10 max-w-prose text-lg leading-relaxed text-mist">
            {COPY.chat.sub}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="h-[36rem] overflow-hidden rounded-2xl border border-line bg-panel/70 shadow-panel">
            <ChatWindow />
          </div>
        </Reveal>

        <div className="mt-3 text-right">
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-mist transition-colors hover:text-accent"
          >
            Open full-screen
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
