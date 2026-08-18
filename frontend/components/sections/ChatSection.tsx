"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Section } from "./Section";
import { ChatWindow } from "../ChatWindow";

export function ChatSection() {
  return (
    <Section
      id="chat"
      eyebrow="The flagship"
      title={
        <>
          Interview her <span className="text-gold italic">right now</span>
        </>
      }
    >
      <p className="max-w-prose text-mist -mt-4 mb-8 text-[15px] leading-relaxed">
        This is Jiya&apos;s AI representative — a RAG agent she built, grounded in
        her resume and the repos above. It cites its sources, refuses what it
        can&apos;t back up, and books real meetings on her calendar. Probe it the
        way you&apos;d probe her.
      </p>

      <div className="h-[36rem] overflow-hidden rounded-2xl border border-veil bg-stage/60 shadow-[0_0_80px_-30px_rgba(216,169,96,0.25)]">
        <ChatWindow />
      </div>

      <div className="mt-3 text-right">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-gold transition-colors"
        >
          Open full-screen
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Section>
  );
}
