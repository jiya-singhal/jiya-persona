"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { COPY } from "@/content/profile";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { Reveal } from "@/components/primitives/Reveal";
import { ChatWindow } from "../ChatWindow";
import { Doodle } from "@/components/primitives/Doodle";
import { WashiTape } from "@/components/primitives/WashiTape";

export function ChatSection() {
  return (
    <section id="chat" className="relative">
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <SectionHeading
          number={COPY.chat.number}
          eyebrow={COPY.chat.eyebrow}
          title={COPY.chat.title}
          color="sky"
        />
        <Reveal>
          <p className="-mt-4 mb-10 max-w-prose text-lg font-medium leading-relaxed text-ink-muted">
            {COPY.chat.sub}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative">
            <WashiTape color="sky" rotate={-3} className="absolute -top-3 left-10 z-10" />
            <WashiTape color="butter" rotate={4} width={80} className="absolute -top-3 right-10 z-10" />
            <Doodle shape="heart" color="blush" size={30} rotate={-12} className="absolute -bottom-4 -left-3 z-10" />
            <div className="sticker h-[36rem] overflow-hidden rounded-[20px] bg-card">
              <ChatWindow />
            </div>
          </div>
        </Reveal>

        <div className="mt-3 text-right">
          <Link
            href="/chat"
            className="link-wavy inline-flex items-center gap-1.5 text-sm"
          >
            Open full-screen
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
