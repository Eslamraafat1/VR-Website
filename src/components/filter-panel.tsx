"use client";

import { useId, useState, type ReactNode } from "react";
import { useApp } from "./providers";
import { IconChevron, IconFilter } from "./ui/icons";

/**
 * Filters stay one tap away on phones instead of pushing results a full screen down.
 * From lg up the panel is always open (sticky sidebar).
 */
export default function FilterPanel({ active, count, children }: { active: number; count: number; children: ReactNode }) {
  const { t, num } = useApp();
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <aside aria-label={t("dir.filters")} className="lg:sticky lg:top-28 lg:self-start">
      <div className="sticky top-16 z-20 transition-[top] duration-300 [html[data-hdr=hidden]_&]:top-0 -mx-[clamp(1rem,4vw,4rem)] border-y border-line bg-bg/90 px-[clamp(1rem,4vw,4rem)] py-1 backdrop-blur-md lg:hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id} className="vx-press flex min-h-12 w-full items-center justify-between gap-3">
          <span className="mono-label flex items-center gap-2 !text-fg"><IconFilter width={18} /> {t("dir.filters")}{active > 0 && <span className="grid size-5 place-items-center rounded-full bg-champagne text-[11px] font-semibold text-[var(--on-accent)]">{num(active)}</span>}</span>
          <span className="mono-label flex items-center gap-2">{num(count)} <IconChevron width={16} className={`transition-transform duration-300 ${open ? "-rotate-90" : "rotate-90"}`} /></span>
        </button>
      </div>
      <div id={id} className={`grid transition-[grid-template-rows,opacity] duration-300 lg:!grid-rows-[1fr] lg:!opacity-100 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden"><div className="space-y-7 pb-2 pt-6 lg:space-y-8 lg:pt-0">{children}</div></div>
      </div>
    </aside>
  );
}
