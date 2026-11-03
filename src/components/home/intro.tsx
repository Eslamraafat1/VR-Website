"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useApp } from "@/components/providers";
import { prefersReducedMotion } from "@/lib/gsap";

const IntroScene = dynamic(() => import("./intro-scene"), { ssr: false });
const KEY = "vistra.intro.seen";

function canWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

/** Cinematic opening. Shown once per browser session; always skippable. */
export default function Intro() {
  const { t, locale } = useApp();
  const [show, setShow] = useState(false);
  const [gl, setGl] = useState(false);
  const [light, setLight] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const prog = useRef({ v: 0 });
  const tl = useRef<gsap.core.Timeline | null>(null);
  const closing = useRef(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch { /* storage unavailable */ }
    if (seen) return;
    const mobile = window.matchMedia("(max-width: 768px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    /* eslint-disable react-hooks/set-state-in-effect -- browser-only capability detection after mount */
    setGl(!prefersReducedMotion() && canWebGL());
    setLight(mobile);
    setShow(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!show || !root.current) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const T = gsap.timeline();
      tl.current = T;
      T.to(prog.current, { v: 1, duration: reduced ? 0.01 : 6.2, ease: "power1.inOut" }, 0)
        .from(".intro-line", { scaleX: 0, duration: 1.4, ease: "power3.out" }, 0.4)
        .from(".intro-letter", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.06, ease: "power4.out" }, reduced ? 0.1 : 2.6)
        .from(".intro-tag", { opacity: 0, y: 12, duration: 0.8 }, reduced ? 0.2 : 4.0)
        .from(".intro-cta", { opacity: 0, y: 12, duration: 0.7 }, reduced ? 0.3 : 4.7);
    }, root);
    return () => ctx.revert();
  }, [show]);

  const finish = () => {
    if (closing.current) return;
    closing.current = true;
    try { sessionStorage.setItem(KEY, "1"); } catch { /* storage unavailable */ }
    tl.current?.kill();
    const el = root.current;
    if (!el) { setShow(false); return; }
    gsap.to(el, {
      clipPath: "circle(0% at 50% 50%)", duration: prefersReducedMotion() ? 0.01 : 0.9, ease: "power3.inOut",
      onComplete: () => { document.body.style.overflow = ""; setShow(false); },
    });
  };

  useEffect(() => {
    if (!show) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") finish(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [show]);

  if (!show) return null;
  return (
    <div ref={root} role="dialog" aria-label="VISTRA intro" data-theme="dark" className="fixed inset-0 z-[110] overflow-hidden bg-[#05060a] text-[#f4f1ea]" style={{ clipPath: "circle(150% at 50% 50%)" }}>
      {gl ? <IntroScene prog={prog} light={light} /> : (
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(123,231,245,0.12),transparent_60%)]" />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-[#05060a]/70" />
      <div aria-hidden className="intro-line absolute inset-x-0 top-1/2 mx-auto h-px w-[min(70vw,900px)] origin-center bg-gradient-to-r from-transparent via-[#c8a96a] to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="flex overflow-hidden text-[clamp(2.6rem,10vw,8rem)] font-semibold leading-none tracking-[0.28em]" dir="ltr" aria-label="VISTRA">
          {"VISTRA".split("").map((c, i) => <span key={i} className="intro-letter inline-block" aria-hidden>{c}</span>)}
          <sup className="intro-letter ms-1 text-[0.25em] tracking-normal" aria-hidden>®</sup>
        </h1>
        <p className="intro-tag mono-label !text-[#aab2bf]" lang={locale}>{t("intro.line")}</p>
        <button className="intro-cta btn btn-solid" onClick={finish}>{t("intro.enter")}</button>
      </div>
      <button className="mono-label absolute end-5 top-5 z-10 border border-white/20 bg-black/30 px-4 py-2 !text-[#f4f1ea] backdrop-blur hover:border-[#c8a96a]" onClick={finish}>{t("intro.skip")} ✕</button>
    </div>
  );
}
