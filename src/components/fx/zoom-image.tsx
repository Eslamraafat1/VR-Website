"use client";

import { useRef } from "react";

/** Product image with a hover magnifier (mouse only) and a soft glow tinted by the chosen variant colour. */
export default function ZoomImage({ src, alt, glow, className = "" }: { src: string; alt: string; glow?: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const w = wrap.current, i = img.current;
    if (!w || !i) return;
    const r = w.getBoundingClientRect();
    i.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    i.style.transform = "scale(1.9)";
  };
  const leave = () => { if (img.current) img.current.style.transform = ""; };
  return (
    <div ref={wrap} onPointerMove={move} onPointerLeave={leave} className={`relative overflow-hidden bg-surface ${className}`}>
      {glow && <div aria-hidden className="pointer-events-none absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(70% 70% at 50% 55%, ${glow}55, transparent 70%)` }} />}
      <img ref={img} src={src} alt={alt} className="relative h-full w-full cursor-zoom-in object-cover mix-blend-normal transition-transform duration-300 ease-out" />
    </div>
  );
}
