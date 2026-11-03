"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useApp } from "./providers";
import type { DictKey } from "@/i18n/dict";

/**
 * Desktop-only contextual cursor. The native pointer is never hidden: this is an
 * additional label that follows the pointer over elements carrying `data-cursor`.
 */
export default function Cursor() {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX + 18);
      y(e.clientY + 18);
      const target = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      setKind(target?.dataset.cursor ?? null);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); gsap.killTweensOf(el); };
  }, []);

  return (
    <div ref={ref} className="vx-cursor" aria-hidden>
      <span
        className="mono-label inline-block border border-champagne bg-bg/80 px-2.5 py-1 text-fg backdrop-blur transition-[opacity,transform] duration-200"
        style={{ opacity: kind ? 1 : 0, transform: kind ? "scale(1)" : "scale(0.8)" }}
      >
        {kind ? t(`cursor.${kind}` as DictKey) : ""}
      </span>
    </div>
  );
}
