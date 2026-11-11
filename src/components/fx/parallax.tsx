"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap";

/** Scroll-scrubbed parallax + slow zoom for a cover image. Place inside a relatively positioned, overflow-hidden parent. */
export default function Parallax({ children, className = "absolute inset-0" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const host = el.parentElement ?? el;
    const tween = gsap.fromTo(el, { yPercent: 0, scale: 1.02 }, { yPercent: 12, scale: 1.18, ease: "none", scrollTrigger: { trigger: host, start: "top top", end: "bottom top", scrub: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); ScrollTrigger.refresh(); };
  }, []);
  return <div ref={ref} className={`${className} will-change-transform`}>{children}</div>;
}
