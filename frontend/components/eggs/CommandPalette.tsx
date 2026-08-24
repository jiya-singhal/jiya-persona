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
    { label: isTwoAM ? "☀ Leave 2 AM mode" : "☾ Enter 2 AM mode", run: () => { setOpen(false); toggleTwoAM(); } },
    { label: "📄 Open resume", run: () => { setOpen(false); window.open("/resume.pdf", "_blank"); } },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-night/70 px-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ask Jiya anything"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-panel shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(value.trim());
          }}
          className="border-b border-line"
        >
          <label className="flex items-center gap-3 px-4">
            <span className="font-serif text-lg text-silver" aria-hidden="true">
              ☾
            </span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask Jiya anything…"
              className="w-full bg-transparent py-4 text-[15px] text-ivory outline-none placeholder:text-mist"
            />
            <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-mist">
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
                className="w-full px-4 py-2.5 text-left text-sm text-mist transition-colors hover:bg-night/60 hover:text-ivory"
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          enter → ask the AI persona · answers cite sources
        </p>
      </div>
    </div>
  );
}
