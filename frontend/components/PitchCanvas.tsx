"use client";

import { useEffect, useRef } from "react";

/**
 * Signature element: a live f0-style pitch trace, like the contours Jiya
 * benchmarks at Sing One Song. It idles on a slow melodic wander and bends
 * toward the cursor like a pitch analyzer following a voice.
 * Static curve when prefers-reduced-motion.
 */
export function PitchCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    // Cursor influence: x position [0..1], pitch offset [-1..1]
    const cursor = { x: 0.5, y: 0, active: false };
    // Trailing pitch value so the trace glides instead of jumping
    let glide = 0;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function melody(t: number, x: number): number {
      // Slow wandering "melody" — sum of detuned sines, normalized ~[-1, 1]
      return (
        0.45 * Math.sin(x * 4.1 + t * 0.00045) +
        0.3 * Math.sin(x * 9.7 - t * 0.0007) +
        0.25 * Math.sin(x * 2.3 + t * 0.0002)
      );
    }

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const mid = h * 0.55;
      const amp = h * 0.28;

      // Faint Hz gridlines — the analyzer's ruled paper
      ctx.strokeStyle = "rgba(154, 147, 168, 0.10)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const gy = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Cursor pull glides toward its target
      const target = cursor.active ? cursor.y : 0;
      glide += (target - glide) * 0.06;

      // Harmonic ghost trace (an octave "above", faint)
      ctx.beginPath();
      for (let px = 0; px <= w; px += 3) {
        const x = px / w;
        const pull = Math.exp(-Math.pow((x - cursor.x) * 4, 2)) * glide;
        const y = mid - 14 + (melody(t, x + 0.33) * 0.5 + pull) * amp * 0.55;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.strokeStyle = "rgba(200, 80, 46, 0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Main f0 trace — temple gold
      ctx.beginPath();
      for (let px = 0; px <= w; px += 2) {
        const x = px / w;
        const pull = Math.exp(-Math.pow((x - cursor.x) * 4, 2)) * glide;
        const y = mid + (melody(t, x) * 0.6 + pull) * amp;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.strokeStyle = "rgba(216, 169, 96, 0.9)";
      ctx.lineWidth = 1.75;
      ctx.stroke();
    }

    function loop(t: number) {
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    function onMove(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (e.clientY < rect.top - 200 || e.clientY > rect.bottom + 200) {
        cursor.active = false;
        return;
      }
      cursor.active = true;
      cursor.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      // Above the midline = pitch up
      cursor.y = Math.min(1, Math.max(-1, ((rect.top + rect.height / 2 - e.clientY) / rect.height) * 2));
    }

    function onLeave() {
      cursor.active = false;
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
