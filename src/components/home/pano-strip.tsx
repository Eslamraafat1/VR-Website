"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Lightweight 360° teaser: pans the real equirectangular panorama horizontally; drag to scrub.
 * (The full interactive sphere lives in /experience and is loaded only on demand.)
 */
export default function PanoStrip({ src, className = "", label }: { src: string; className?: string; label?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let x = 0, raf = 0, drag = false, lastX = 0, vis = true;
    const reduced = prefersReducedMotion();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; });
    io.observe(node);
    const tick = () => {
      if (vis && !drag && !reduced) x -= 0.25;
      node.style.backgroundPosition = `${x}px 50%`;
      raf = requestAnimationFrame(tick);
    };
    const down = (e: PointerEvent) => { drag = true; lastX = e.clientX; node.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (drag) { x += e.clientX - lastX; lastX = e.clientX; } };
    const up = () => { drag = false; };
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      node.removeEventListener("pointerdown", down); node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up); node.removeEventListener("pointercancel", up);
    };
  }, []);
  return (
    <div ref={el} role="img" aria-label={label ?? "360° panorama preview"} data-cursor="explore"
      className={`cursor-grab touch-pan-y bg-repeat-x active:cursor-grabbing ${className}`}
      style={{ backgroundImage: `url(${src})`, backgroundSize: "auto 100%" }} />
  );
}
