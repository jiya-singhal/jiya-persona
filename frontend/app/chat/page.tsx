import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChatWindow } from "@/components/ChatWindow";

export const metadata: Metadata = {
  title: "Jiya Singhal — AI persona",
  description:
    "Talk to Jiya's AI persona. Grounded in her resume and GitHub, with sources cited under every answer.",
};

export default function ChatPage() {
  return (
    <main className="flex h-screen flex-col">
      <header className="border-b border-line px-6 py-5">
        <div className="mx-auto flex max-w-prose items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              AI persona
            </div>
            <h1 className="mt-1 font-serif text-2xl text-ivory">Jiya Singhal</h1>
          </div>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.14em] text-mist transition-colors hover:text-accent"
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
