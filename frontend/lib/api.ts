/**
 * SSE client for the /api/chat proxy.
 * Backend events: sources, text_delta, tool_call, error, done.
 */

export type SourceMeta = {
  source_type?: string;
  section?: string;
  repo?: string;
  field?: string;
  file_path?: string;
  company?: string;
  [k: string]: unknown;
};

export type Source = {
  text: string;
  metadata: SourceMeta;
  score: number;
};

export type ToolCallEvent = {
  name: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
};

export type ChatEvent =
  | { type: "sources"; sources: Source[] }
  | { type: "text_delta"; delta: string }
  | { type: "tool_call"; tool: ToolCallEvent }
  | { type: "error"; message: string }
  | { type: "done" };

export type HistoryItem = { role: "user" | "model"; text: string };

export async function* streamChat(
  message: string,
  history: HistoryItem[],
  signal?: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!resp.ok || !resp.body) {
    yield { type: "error", message: `HTTP ${resp.status}` };
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let currentEvent: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split("\n");
    buf = lines.pop() || "";

    for (const raw of lines) {
      const line = raw.replace(/\r$/, "");
      if (!line) {
        currentEvent = null;
        continue;
      }
      if (line.startsWith("event:")) {
        currentEvent = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        const payload = line.slice("data:".length).trim();
        let obj: any;
        try {
          obj = JSON.parse(payload);
        } catch {
          continue;
        }
        if (currentEvent === "sources") {
          yield { type: "sources", sources: obj.sources ?? [] };
        } else if (currentEvent === "text_delta") {
          yield { type: "text_delta", delta: obj.delta ?? "" };
        } else if (currentEvent === "tool_call") {
          yield { type: "tool_call", tool: obj as ToolCallEvent };
        } else if (currentEvent === "error") {
          yield { type: "error", message: obj.message ?? "unknown" };
          return;
        } else if (currentEvent === "done") {
          yield { type: "done" };
          return;
        }
      }
    }
  }
}
