"use client";

import type { ReactNode } from "react";

export function MessageBubble({
  role,
  children,
}: {
  role: "user" | "agent";
  children: ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-prose rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-ink text-bg"
            : "bg-white border border-rule text-ink"
        }`}
      >
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </div>
  );
}
