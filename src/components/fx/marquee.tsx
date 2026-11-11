"use client";

import { getStores } from "@/data/service";

/** Endless brand ticker. Slows on hover; static for reduced-motion users. */
export default function Marquee() {
  const names = getStores().map((s) => s.name);
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pe-10" dir="ltr">
      {names.map((n, i) => (
        <li key={n + i} className="flex items-center gap-10 whitespace-nowrap">
          <span className="text-4xl font-extralight uppercase tracking-tight text-transparent [-webkit-text-stroke:1px_var(--fg-3)] transition-colors duration-300 hover:text-champagne hover:[-webkit-text-stroke-color:var(--champagne)] md:text-6xl">{n}</span>
          <span className="text-champagne">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="VISTRA brands" className="group relative overflow-hidden border-y border-line py-8">
      <div className="vx-marquee flex w-max">{row(false)}{row(true)}{row(true)}</div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent" />
    </section>
  );
}
