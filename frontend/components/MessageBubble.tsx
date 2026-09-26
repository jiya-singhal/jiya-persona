"use client";

import type { ReactNode } from "react";
import { Doodle } from "@/components/primitives/Doodle";

export function MessageBubble({
  role,
  children,
}: {
  role: "user" | "agent";
  children: ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-1.5 border-outline bg-lilac"
        >
          <Doodle shape="sparkle" color="butter" size={16} outline="var(--on-pastel)" />
        </span>
      )}
      <div
        className={`max-w-prose rounded-[20px] border-1.5 border-outline px-4 py-3 ${
          isUser
            ? "rounded-br-[4px] bg-sky text-on-pastel"
            : "rounded-bl-[4px] bg-card text-ink shadow-sticker"
        }`}
      >
        <div className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </div>
  );
}
