"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "jiya-2am";
const EVENT = "jiya-2am-change";

function applied(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("two-am");
}

/**
 * 2 AM mode: an even darker palette, toggled by clicking the moon.
 * State lives on <html class="two-am"> (set pre-hydration by an inline
 * script in layout.tsx) + localStorage. A custom event keeps every
 * hook instance in sync.
 */
export function useTwoAM() {
  const [isTwoAM, setIsTwoAM] = useState(false);

  useEffect(() => {
    setIsTwoAM(applied());
    const sync = () => setIsTwoAM(applied());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = useCallback(() => {
    const next = !applied();
    document.documentElement.classList.toggle("two-am", next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* private mode etc. — the class still applies for this visit */
    }
    window.dispatchEvent(new Event(EVENT));

    // A quiet mono toast, self-removing. DOM-direct so any caller works.
    const prev = document.getElementById("jiya-2am-toast");
    prev?.remove();
    const toast = document.createElement("div");
    toast.id = "jiya-2am-toast";
    toast.textContent = next ? "☾ 2 AM mode" : "☀ back before sunrise";
    toast.setAttribute("role", "status");
    toast.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:100;" +
      "font-family:var(--font-jetbrains),monospace;font-size:12px;letter-spacing:0.08em;" +
      "color:rgb(var(--mist));background:rgb(var(--panel));border:1px solid rgb(var(--line));" +
      "border-radius:9999px;padding:8px 16px;opacity:0;transition:opacity 0.5s ease;pointer-events:none";
    document.body.appendChild(toast);
    requestAnimationFrame(() => (toast.style.opacity = "1"));
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 600);
    }, 2200);
  }, []);

  return { isTwoAM, toggle };
}
