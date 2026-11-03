"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/gsap";

const EVENT = "vistra:portal";

/** Persistent overlay (mounted in the root layout) that turns the page into an expanding architectural portal. */
export function PortalHost() {
  const router = useRouter();
  const pathname = usePathname();
  const cover = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const state = useRef<{ x: number; y: number; waiting: boolean }>({ x: 0, y: 0, waiting: false });
  const [visible, setVisible] = useState(false);

  const paint = useCallback((s: number) => {
    const { x, y } = state.current;
    if (cover.current) cover.current.style.clipPath = `circle(${s * 50}px at ${x}px ${y}px)`;
    if (ring.current) Object.assign(ring.current.style, { left: `${x}px`, top: `${y}px`, transform: `translate(-50%,-50%) scale(${s})`, opacity: s > 0.05 ? "1" : "0" });
  }, []);

  useEffect(() => {
    const open = (e: Event) => {
      const { href, x, y } = (e as CustomEvent<{ href: string; x: number; y: number }>).detail;
      state.current = { x, y, waiting: true };
      setVisible(true);
      const max = (Math.hypot(window.innerWidth, window.innerHeight) * 2.2) / 100;
      const o = { s: 0 };
      gsap.to(o, { s: max, duration: 0.75, ease: "power3.in", onUpdate: () => paint(o.s), onComplete: () => router.push(href) });
    };
    window.addEventListener(EVENT, open);
    return () => window.removeEventListener(EVENT, open);
  }, [paint, router]);

  // once the destination has mounted, collapse the portal toward the clicked point to reveal it
  useEffect(() => {
    if (!state.current.waiting || pathname === "/") return;
    state.current.waiting = false;
    const max = (Math.hypot(window.innerWidth, window.innerHeight) * 2.2) / 100;
    const o = { s: max };
    const t = gsap.to(o, { s: 0, duration: 0.9, delay: 0.25, ease: "power3.inOut", onUpdate: () => paint(o.s), onComplete: () => setVisible(false) });
    return () => { t.kill(); };
  }, [pathname, paint]);

  if (!visible) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120]">
      <div ref={cover} className="absolute inset-0 bg-[#05060a]" style={{ clipPath: "circle(0px at 50% 50%)" }} />
      <div ref={ring} className="absolute size-[100px] rounded-full border border-[#c8a96a]" style={{ opacity: 0 }} />
    </div>
  );
}

/** Link that opens the destination through the portal transition (falls back to normal navigation). */
export function PortalLink({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode; "data-cursor"?: string }) {
  const router = useRouter();
  return (
    <a
      href={href}
      className={className}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        if (prefersReducedMotion()) return router.push(href);
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        window.dispatchEvent(new CustomEvent(EVENT, { detail: { href, x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
      }}
    >
      {children}
    </a>
  );
}
