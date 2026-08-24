"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Section } from "./Section";
import { ChatWindow } from "../ChatWindow";
import { Doodle } from "../doodles/Doodle";
import { COPY } from "@/content/profile";

export function ChatSection() {
  return (
    <Section id="chat" eyebrow={COPY.chat.eyebrow} title={COPY.chat.title}>
      <div className="-mt-4 mb-8 flex flex-wrap items-end gap-3">
        <p className="max-w-prose text-lg leading-relaxed text-sub">
          {COPY.chat.sub}{" "}
          <span className="text-sub/80 text-[15px]">
            Every answer is grounded in my resume and repos, cited below each
            response - and she can book a real slot on my calendar.
          </span>
        </p>
        <Doodle
          kind="arrow"
          delay={0.4}
          className="h-10 w-14 rotate-[64deg] text-butter-deep"
          strokeWidth={2.5}
        />
      </div>

      <div className="relative">
        {/* washi tape holding the frame to the page */}
        <span
          aria-hidden="true"
          className="absolute -top-3 left-10 z-10 h-6 w-16 rotate-[-5deg] bg-paper-butter/80 shadow-sm"
        />
        <span
          aria-hidden="true"
          className="absolute -top-3 right-14 z-10 h-6 w-16 rotate-[4deg] bg-paper-butter/80 shadow-sm"
        />
        <div className="h-[36rem] overflow-hidden rounded-2xl border border-line bg-card/70 shadow-panel">
          <ChatWindow />
        </div>
      </div>

      <div className="mt-3 text-right">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-sub transition-colors hover:text-butter-deep"
        >
          Open full-screen
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Section>
  );
}
