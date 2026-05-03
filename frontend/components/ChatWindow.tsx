"use client";

import { useEffect, useRef, useState } from "react";
import { streamChat, type HistoryItem, type Source, type ToolCallEvent } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";
import { SourceCitation } from "./SourceCitation";
import { BookingInline } from "./BookingInline";

type AgentTurn = {
  role: "agent";
  text: string;
  sources: Source[];
  toolCalls: ToolCallEvent[];
  pending: boolean;
};
type UserTurn = { role: "user"; text: string };
type Turn = AgentTurn | UserTurn;

const SUGGESTIONS = [
  "What did Jiya do at SingOneSong?",
  "Tell me about the search-listings project",
  "Can I book a 30-min chat next week?",
];

export function ChatWindow() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userTurn: UserTurn = { role: "user", text };
    const agentTurn: AgentTurn = {
      role: "agent",
      text: "",
      sources: [],
      toolCalls: [],
      pending: true,
    };
    setTurns((prev) => [...prev, userTurn, agentTurn]);
    setInput("");
    setStreaming(true);

    const history: HistoryItem[] = turns.flatMap((t): HistoryItem[] => {
      if (t.role === "user") return [{ role: "user" as const, text: t.text }];
      return t.text ? [{ role: "model" as const, text: t.text }] : [];
    });

    try {
      for await (const evt of streamChat(text, history)) {
        setTurns((prev) => {
          const next = [...prev];
          const last = next[next.length - 1] as AgentTurn;
          if (evt.type === "sources") {
            next[next.length - 1] = { ...last, sources: evt.sources };
          } else if (evt.type === "text_delta") {
            next[next.length - 1] = { ...last, text: last.text + evt.delta };
          } else if (evt.type === "tool_call") {
            next[next.length - 1] = {
              ...last,
              toolCalls: [...last.toolCalls, evt.tool],
            };
          } else if (evt.type === "error") {
            next[next.length - 1] = {
              ...last,
              text: last.text || `Error: ${evt.message}`,
              pending: false,
            };
          } else if (evt.type === "done") {
            next[next.length - 1] = { ...last, pending: false };
          }
          return next;
        });
        if (evt.type === "done" || evt.type === "error") break;
      }
    } finally {
      setStreaming(false);
      setTurns((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "agent" && last.pending) {
          next[next.length - 1] = { ...last, pending: false };
        }
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-prose space-y-5">
          {turns.length === 0 ? (
            <div className="space-y-6 pt-4">
              <p className="text-ink/75 leading-relaxed">
                I&apos;m Jiya&apos;s AI rep. Ask about her work at SingOneSong, her public
                projects, or book a 30-min chat with her directly. Every answer is
                grounded in her resume and GitHub — sources are shown below each
                response.
              </p>
              <div className="flex flex-col gap-2">
                <div className="text-[11px] uppercase tracking-wider text-muted">
                  Try asking
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm rounded-lg border border-rule bg-white px-3 py-2 hover:border-clay/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            turns.map((t, i) =>
              t.role === "user" ? (
                <MessageBubble key={i} role="user">
                  {t.text}
                </MessageBubble>
              ) : (
                <div key={i} className="space-y-2">
                  <MessageBubble role="agent">
                    {t.text || (t.pending ? <Pending /> : "")}
                  </MessageBubble>
                  {t.toolCalls.map((tc, j) => (
                    <BookingInline key={j} tool={tc} />
                  ))}
                  {t.sources.length > 0 && (
                    <SourceCitation sources={t.sources} />
                  )}
                </div>
              ),
            )
          )}
        </div>
      </div>

      <div className="border-t border-rule bg-bg/80 backdrop-blur px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto max-w-prose flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={streaming ? "…thinking" : "Ask about Jiya's work, or book a chat"}
            disabled={streaming}
            className="flex-1 rounded-xl border border-rule bg-white px-4 py-3 text-[15px] outline-none focus:border-clay/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-xl bg-clay px-5 py-3 text-bg text-sm font-medium disabled:opacity-40 hover:bg-clay/90 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function Pending() {
  return (
    <span className="inline-flex gap-1 items-end">
      <Dot delay="0ms" />
      <Dot delay="150ms" />
      <Dot delay="300ms" />
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-muted animate-pulse"
      style={{ animationDelay: delay }}
    />
  );
}
