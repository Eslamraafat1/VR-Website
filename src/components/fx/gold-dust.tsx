"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/** Drifting champagne dust that gently flees the pointer. Canvas, paused when off-screen. */
export default function GoldDust({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || prefersReducedMotion()) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const small = window.matchMedia("(max-width: 640px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    let w = 0, h = 0, raf = 0, visible = true;
    const mouse = { x: -999, y: -999 };
    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; ph: number };
    let ps: P[] = [];
    const resize = () => {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(small ? 36 : 90, (w * h) / 16000));
      ps = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 0.6 + Math.random() * 1.8, vx: (Math.random() - 0.5) * 0.15, vy: -0.1 - Math.random() * 0.3, a: 0.25 + Math.random() * 0.6, ph: Math.random() * 6.28 }));
    };
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { const d = Math.sqrt(d2) || 1; const f = (1 - d / 120) * 1.4; p.x += (dx / d) * f; p.y += (dy / d) * f; }
        p.x += p.vx + Math.sin(t / 2000 + p.ph) * 0.12; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        const tw = 0.6 + 0.4 * Math.sin(t / 700 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = `rgba(214,184,120,${p.a * tw})`;
        ctx.shadowColor = "rgba(214,184,120,0.9)"; ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    };
    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const leave = () => { mouse.x = mouse.y = -999; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(c);
    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); window.removeEventListener("pointerleave", leave); };
  }, []);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
