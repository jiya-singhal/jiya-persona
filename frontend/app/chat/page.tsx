import type { Metadata } from "next";
import Link from "next/link";
import { ChatWindow } from "@/components/ChatWindow";

export const metadata: Metadata = {
  title: "Jiya Singhal — AI rep",
  description:
    "Talk to Jiya's AI representative. Grounded in her resume and GitHub.",
};

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col">
      <header className="border-b border-veil px-6 py-5">
        <div className="mx-auto max-w-prose flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">
              AI representative
            </div>
            <h1 className="mt-1 font-display text-2xl tracking-tight">
              Jiya Singhal
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm text-mist hover:text-gold transition-colors"
          >
            ← Portfolio
          </Link>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </main>
  );
}
