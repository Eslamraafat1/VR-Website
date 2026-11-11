"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap";

/** Counts from 0 to `to` when scrolled into view. `format` localises digits. */
export default function CountUp({ to, format = (n: number) => String(n) }: { to: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const o = { v: 0 };
    el.textContent = format(0);
    const tween = gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 95%", once: true }, onUpdate: () => { el.textContent = format(Math.round(o.v)); } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); ScrollTrigger.refresh(); el.textContent = format(to); };
  }, [to, format]);
  return <span ref={ref}>{format(to)}</span>;
}
