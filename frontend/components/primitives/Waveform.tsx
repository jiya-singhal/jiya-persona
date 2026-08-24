"use client";

import { useEffect, useRef } from "react";

/**
 * The site's voice identity: a barely-alive waveform line that ripples
 * faintly toward the cursor. Canvas-based; rAF pauses when off-screen or
 * the tab is hidden; renders a static gentle wave under reduced motion.
 */
export function Waveform({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let mouseX = -1;
    let raf = 0;
    let t = 0;
    let running = false;

    const accent = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      return v ? `rgb(${v.split(" ").join(",")})` : "rgb(157,176,255)";
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      const color = accent();

      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        // Barely-alive drift + a faint ripple near the cursor.
        let amp = Math.sin(x * 0.045 + t * 0.9) * 2.2 + Math.sin(x * 0.011 - t * 0.5) * 1.6;
        if (mouseX >= 0) {
          const d = Math.abs(x - mouseX);
          amp += Math.exp(-(d * d) / 2800) * Math.sin(x * 0.12 + t * 2.4) * 7;
        }
        const y = mid + amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      t += 0.016;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!running && !reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reduced) {
      draw(); // one static frame
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX >= rect.left && e.clientX <= rect.right ? e.clientX - rect.left : -1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
