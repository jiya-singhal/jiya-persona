import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { Motif } from "@/components/primitives/Motif";

export const metadata: Metadata = {
  title: "Jiya Singhal · AI persona",
  description:
    "Talk to Jiya's AI persona. Grounded in her resume and GitHub, with sources cited under every answer.",
};

export default function ChatPage() {
  return (
    <main className="flex h-screen flex-col">
      <header className="border-b-1.5 border-outline bg-sky px-6 py-5 text-on-pastel">
        <div className="mx-auto flex max-w-prose items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.16em]">AI persona</div>
            <h1 className="mt-1 inline-flex items-center gap-2 font-display text-3xl font-semibold">
              Jiya Singhal
              <Motif name="waveform" bare size={24} />
            </h1>
          </div>
          <Link
            href="/"
            className="btn btn-ghost px-4 py-2 text-sm"
          >
            ← Portfolio
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <Suspense>
          <ChatWindow autosendFromQuery />
        </Suspense>
      </div>
    </main>
  );
}
