"use client";

import { useRef, type ReactNode } from "react";

/** Wraps a tile with a pointer-following light and subtle 3D tilt (mouse pointers only). */
export default function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`vx-spot relative h-full w-full transition-transform duration-300 ease-out will-change-transform ${className}`}>
      {children}
      <div aria-hidden className="vx-spot-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300" />
    </div>
  );
}
