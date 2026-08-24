"use client";

import { useRef, useState } from "react";
import { TOOLBOX, TERMINAL_COMMANDS } from "@/content/profile";
import { TerminalBlock } from "@/components/primitives/TerminalBlock";
import { Reveal } from "@/components/primitives/Reveal";
import { CatWalk } from "@/components/eggs/CatWalk";

type Line = { text: string; kind: "cmd" | "out" };

export function Toolbox() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cat, setCat] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function run(raw: string) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear") {
      setLines([]);
      return;
    }
    let out: string[];
    if (cmd === "cat") {
      out = ["🐈‍⬛ …there she goes."];
      setCat(false);
      requestAnimationFrame(() => setCat(true));
    } else {
      out = TERMINAL_COMMANDS[cmd] ?? [`command not found: ${cmd} — try 'help'`];
    }
    setLines((prev) => [
      ...prev,
      { text: `$ ${raw.trim()}`, kind: "cmd" },
      ...out.map((t): Line => ({ text: t, kind: "out" })),
    ]);
  }

  return (
    <section id="toolbox" className="bg-deep">
      <div className="mx-auto w-full max-w-shell px-6 py-24">
        <Reveal>
          <TerminalBlock title="jiya@midnight-lab: ~/toolbox">
            <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
              {TOOLBOX.map((t) => (
                <div key={t.group}>
                  <span className="text-accent">{t.group}</span>
                  <p className="mt-0.5 text-mist">{t.items}</p>
                </div>
              ))}
            </div>

            {/* the quiet part: it's a real prompt */}
            <div
              className="mt-8 cursor-text border-t border-line pt-4"
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((l, i) => (
                <p key={i} className={l.kind === "cmd" ? "text-ivory" : "text-mist"}>
                  {l.text}
                </p>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(input);
                  setInput("");
                }}
                className="flex items-center gap-2"
              >
                <span className="text-accent" aria-hidden="true">
                  $
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="A small terminal. Try typing a command."
                  placeholder="try 'whoami'"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-sm text-ivory outline-none placeholder:text-faint"
                />
              </form>
            </div>
          </TerminalBlock>
        </Reveal>
      </div>
      {cat && <CatWalk onDone={() => setCat(false)} />}
    </section>
  );
}
