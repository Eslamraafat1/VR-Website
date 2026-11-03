"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap";

/** Scroll-triggered fade/translate reveal. Content stays visible without JS and for reduced-motion users. */
export default function Reveal({ children, as: Tag = "div", className = "", delay = 0, y = 40 }: { children: ReactNode; as?: ElementType; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const tween = gsap.fromTo(el, { opacity: 0, y }, { opacity: 1, y: 0, duration: 1, delay, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); ScrollTrigger.refresh(); };
  }, [delay, y]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
