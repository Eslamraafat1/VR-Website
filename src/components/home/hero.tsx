"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "@/components/providers";
import Magnetic from "@/components/ui/magnetic";
import { PortalLink } from "@/components/portal";
import { IconArrow } from "@/components/ui/icons";
import PanoStrip from "./pano-strip";
import GoldDust from "@/components/fx/gold-dust";
import { getMall } from "@/data/service";
import { isFinePointer, prefersReducedMotion, registerGsap } from "@/lib/gsap";

export default function Hero() {
  const { t, locale } = useApp();
  const mall = getMall();
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const coord = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const { ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.from(".hero-word", { yPercent: 115, duration: 1.2, stagger: 0.09, ease: "power4.out", delay: 0.2 });
        gsap.from(".hero-fade", { opacity: 0, y: 20, duration: 1, stagger: 0.12, delay: 0.9, ease: "power3.out" });
        const o = { v: 0 };
        gsap.to(o, { v: 1, duration: 2.4, delay: 0.5, ease: "power2.out", onUpdate: () => { if (coord.current) coord.current.textContent = `${mall.coordinates.lat.replace(/[\d.]+/, (n) => (parseFloat(n) * o.v).toFixed(4))} · ${mall.coordinates.lng.replace(/[\d.]+/, (n) => (parseFloat(n) * o.v).toFixed(4))}`; } });
        gsap.to(bg.current, { scale: 1.25, yPercent: 8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero-content", { opacity: 0, y: -60, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "70% top", scrub: true } });
      }
    }, el);
    let move: ((e: PointerEvent) => void) | undefined;
    if (!reduced && isFinePointer() && bg.current) {
      const x = gsap.quickTo(".hero-depth", "x", { duration: 1.2, ease: "power3.out" });
      const y = gsap.quickTo(".hero-depth", "y", { duration: 1.2, ease: "power3.out" });
      move = (e) => { x((e.clientX / window.innerWidth - 0.5) * -30); y((e.clientY / window.innerHeight - 0.5) * -20); };
      window.addEventListener("pointermove", move);
    }
    return () => { if (move) window.removeEventListener("pointermove", move); ctx.revert(); ScrollTrigger.refresh(); };
  }, [mall.coordinates.lat, mall.coordinates.lng]);

  const line = (s: string) => s.split(" ").map((w, i) => <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top"><span className="hero-word me-[0.24em] inline-block">{w}</span></span>);

  return (
    <section ref={root} className="relative -mt-16 flex min-h-[100svh] flex-col justify-end overflow-hidden md:-mt-20" aria-labelledby="hero-title">
      <div ref={bg} className="absolute inset-0">
        <div className="hero-depth absolute -inset-8">
          <img src={mall.heroImage} alt="" className="h-full w-full object-cover" fetchPriority="high" />
        </div>
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-[var(--bg)]/30" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/80 via-[var(--bg)]/45 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,transparent_30%,var(--bg)_110%)] opacity-70" />

      <GoldDust className="z-[5]" />
      <div className="hero-content gutter relative z-10 grid gap-10 pb-14 pt-32 lg:grid-cols-[1fr_380px] lg:items-end">
        <div>
          <p className="hero-fade mono-label mb-6 flex flex-wrap items-center gap-3 !text-fg"><span className="inline-block size-2 animate-pulse bg-cyan" /><span ref={coord} dir="ltr">{mall.coordinates.lat} · {mall.coordinates.lng}</span></p>
          <h1 id="hero-title" className="display" lang={locale}>
            <span className="block">{line(t("hero.l1"))}</span>
            <span className="block text-champagne">{line(t("hero.l2"))}</span>
          </h1>
          <p className="hero-fade thin mt-8 max-w-xl text-lg leading-relaxed text-fg md:text-xl">{t("hero.sub")}</p>
          <div className="hero-fade mt-10 flex flex-wrap gap-3">
            <Magnetic><PortalLink href="/experience" className="btn btn-solid" data-cursor="explore">{t("hero.cta1")} <IconArrow width={16} /></PortalLink></Magnetic>
            <Magnetic><Link href="/stores" className="btn" data-cursor="discover">{t("hero.cta2")}</Link></Magnetic>
          </div>
        </div>
        <div className="hero-fade hidden lg:block">
          <p className="mono-label mb-2">{t("hero.preview")}</p>
          <PanoStrip src="/panoramas/atrium.jpg" className="h-44 border border-line" />
        </div>
      </div>
      <div className="hero-fade gutter relative z-10 flex items-center justify-between pb-6 max-lg:pb-20">
        <span className="mono-label flex items-center gap-3"><span className="relative block h-10 w-px overflow-hidden bg-line"><span className="absolute inset-x-0 top-0 h-4 animate-[scrolldot_1.8s_ease-in-out_infinite] bg-champagne" /></span>{t("hero.scroll")}</span>
        <span className="mono-label hidden sm:block">VISTRA® — 2026</span>
      </div>
      <style>{`@keyframes scrolldot{0%{transform:translateY(-100%)}100%{transform:translateY(250%)}}`}</style>
    </section>
  );
}
