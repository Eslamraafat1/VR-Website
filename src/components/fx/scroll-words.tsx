"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap";

/** Paragraph whose words light up one by one as it scrolls through the viewport. Fully readable without motion. */
export default function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const words = el.querySelectorAll<HTMLElement>("[data-w]");
    const tween = gsap.fromTo(words, { opacity: 0.18 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); ScrollTrigger.refresh(); gsap.set(words, { clearProps: "opacity" }); };
  }, [text]);
  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => <span key={i} data-w>{w}{" "}</span>)}
    </p>
  );
}
