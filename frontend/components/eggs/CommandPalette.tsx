"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTwoAM } from "./useTwoAM";

function isEditable(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return (
    el.isContentEditable ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT"
  );
}

/**
 * ⌘K → "Ask Jiya anything". A launcher, not an embedded chat: typed
 * questions route to /chat?q=… where the persona answers with sources.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toggle: toggleTwoAM, isTwoAM } = useTwoAM();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (!open && isEditable(e.target)) return;
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setValue("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Simple focus trap: keep Tab cycling inside the dialog.
  useEffect(() => {
    if (!open) return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        "input, button, [tabindex]",
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onTab);
    return () => window.removeEventListener("keydown", onTab);
  }, [open]);

  if (!open) return null;

  const go = (q: string) => {
    setOpen(false);
    router.push(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  };

  const commands = [
    { label: "→ Explore work", run: () => { setOpen(false); router.push("/#work"); } },
    { label: isTwoAM ? "☀ Back to daydream" : "☾ Go stargazing", run: () => { setOpen(false); toggleTwoAM(); } },
    { label: "📄 Open resume", run: () => { setOpen(false); window.open("/resume.pdf", "_blank"); } },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-paper/70 px-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ask Jiya anything"
        className="sticker w-full max-w-lg overflow-hidden rounded-[20px] bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(value.trim());
          }}
          className="border-b-1.5 border-outline bg-lilac"
        >
          <label className="flex items-center gap-3 px-4">
            <span className="text-lg text-on-pastel" aria-hidden="true">
              ☾
            </span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask Jiya anything…"
              className="w-full bg-transparent py-4 text-[15px] font-semibold text-on-pastel outline-none placeholder:text-on-pastel/60"
            />
            <kbd className="rounded-[10px] border-1.5 border-b-[3px] border-on-pastel bg-white px-1.5 py-0.5 font-mono text-[10px] text-on-pastel">
              esc
            </kbd>
          </label>
        </form>
        <ul className="py-2">
          {commands.map((c) => (
            <li key={c.label}>
              <button
                type="button"
                onClick={c.run}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-ink-muted transition-colors hover:bg-butter hover:text-on-pastel"
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t-1.5 border-dashed border-outline/30 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          enter → ask the AI persona · answers cite sources
        </p>
      </div>
    </div>
  );
}
