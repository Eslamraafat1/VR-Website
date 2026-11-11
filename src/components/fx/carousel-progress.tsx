"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Horizontal scroller with a thin progress track underneath, so touch users can see there is more. */
export default function CarouselProgress({ children, className = "" }: { children: ReactNode; className?: string }) {
  const sc = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sc.current;
    if (!el) return;
    const upd = () => {
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? Math.abs(el.scrollLeft) / max : 1;
      const visible = max > 0 ? el.clientWidth / el.scrollWidth : 1;
      if (bar.current) { bar.current.style.width = `${Math.max(visible, 0.12) * 100}%`; bar.current.style.transform = `translateX(${p * (1 / Math.max(visible, 0.12) - 1) * 100 * (document.documentElement.dir === "rtl" ? -1 : 1)}%)`; }
    };
    upd();
    el.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => { el.removeEventListener("scroll", upd); window.removeEventListener("resize", upd); };
  }, []);
  return (
    <>
      <div ref={sc} className={className}>{children}</div>
      <div aria-hidden className="gutter mt-5"><div className="h-px bg-line"><div ref={bar} className="h-px bg-champagne will-change-transform" style={{ width: "30%" }} /></div></div>
    </>
  );
}
