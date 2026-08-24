"use client";

import { useEffect, useRef, useState } from "react";
import { streamChat, type HistoryItem, type Source, type ToolCallEvent } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";
import { SourceCitation } from "./SourceCitation";
import { BookingInline } from "./BookingInline";
import { CHAT_SUGGESTIONS } from "@/content/profile";

type AgentTurn = {
  role: "agent";
  text: string;
  sources: Source[];
  toolCalls: ToolCallEvent[];
  pending: boolean;
};
type UserTurn = { role: "user"; text: string };
type Turn = AgentTurn | UserTurn;

export function ChatWindow({
  autosendFromQuery = false,
}: {
  autosendFromQuery?: boolean;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const autosent = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns]);

  // The ⌘K palette routes here as /chat?q=…; send it once on arrival.
  useEffect(() => {
    if (!autosendFromQuery || autosent.current) return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q?.trim()) {
      autosent.current = true;
      send(q.trim());
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosendFromQuery]);

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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-prose space-y-5">
          {turns.length === 0 ? (
            <div className="space-y-6 pt-2">
              <p className="leading-relaxed text-ivory/80">
                I&apos;m Jiya&apos;s AI persona - ask me anything an interviewer
                would. Every answer is grounded in her resume and GitHub, with
                sources shown below each response. I can also book a real slot
                on her calendar.
              </p>
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[11px] uppercase tracking-wider text-mist">
                  Try asking
                </div>
                {CHAT_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.send)}
                    className="rounded-lg border border-line bg-night px-3 py-2 text-left text-sm text-ivory/85 transition-colors hover:border-accent/50"
                  >
                    {s.label}
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
                    <BookingInline key={j} tool={tc} onPickSlot={send} />
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

      <div className="border-t border-line bg-night/60 px-5 py-4 backdrop-blur sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-prose gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={streaming ? "…thinking" : "Ask about Jiya's work, or book a chat"}
            disabled={streaming}
            className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-[15px] text-ivory outline-none placeholder:text-mist focus:border-accent/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-night transition-colors hover:bg-accent-bright disabled:opacity-40"
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
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-mist"
      style={{ animationDelay: delay }}
    />
  );
}
