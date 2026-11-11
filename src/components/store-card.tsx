"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "./providers";
import { StoreLogo } from "./ui/logo";
import Spotlight from "./fx/spotlight";
import { IconArrow, IconCube } from "./ui/icons";
import { getOffersByStore, getScene } from "@/data/service";
import type { Store } from "@/data/types";
import { isFinePointer, prefersReducedMotion } from "@/lib/gsap";

/** Image that drifts and re-crops with the pointer (desktop only). */
export function LivingImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const w = wrap.current, i = img.current;
    if (!w || !i || !isFinePointer() || prefersReducedMotion()) return;
    const x = gsap.quickTo(i, "x", { duration: 0.8, ease: "power3.out" });
    const y = gsap.quickTo(i, "y", { duration: 0.8, ease: "power3.out" });
    const s = gsap.quickTo(i, "scale", { duration: 0.8, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = w.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * -24);
      y(((e.clientY - r.top) / r.height - 0.5) * -24);
      s(1.12);
    };
    const leave = () => { x(0); y(0); s(1.04); };
    gsap.set(i, { scale: 1.04 });
    w.addEventListener("pointermove", move);
    w.addEventListener("pointerleave", leave);
    return () => { w.removeEventListener("pointermove", move); w.removeEventListener("pointerleave", leave); gsap.killTweensOf(i); };
  }, []);
  return (
    <div ref={wrap} className={`overflow-hidden ${className}`}>
      <img ref={img} src={src} alt={alt} loading="lazy" className="h-full w-full object-cover will-change-transform" />
    </div>
  );
}

/** Directory card. */
export default function StoreCard({ store }: { store: Store }) {
  const { t, L, cat, floorName, pct } = useApp();
  const offer = getOffersByStore(store.id)[0];
  const scene = getScene(store.sceneId);
  return (
    <Spotlight className="h-full"><article className="group flex h-full flex-col border border-line bg-surface transition-colors hover:border-champagne">
      <Link href={`/stores/${store.slug}`} data-cursor="view" className="relative block aspect-[4/3]" aria-label={`${t("stores.view")} ${store.name}`}>
        <LivingImage src={store.coverImage} alt={`${store.name} — ${cat(store.category)}`} className="h-full" />
        {offer && <span className="mono-label absolute start-3 top-3 bg-champagne px-2 py-1 !text-[var(--on-accent)]">{pct(offer.discount)}</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <StoreLogo name={store.name} monogram={store.monogram} color={store.color} size={40} />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-medium">{store.name}</h3>
            <p className="mono-label">{cat(store.category)} · {floorName(store.floorId)}</p>
          </div>
        </div>
        <p className="text-sm text-fg2">{L(store.description)}</p>
        {scene && <p className="mono-label !text-fg3">{L(scene.title)}</p>}
        {offer && <p className="text-sm text-champagne">{L(offer.title)} · {pct(offer.discount)}</p>}
        <div className="mt-auto flex gap-2 pt-2">
          <Link className="btn grow !px-3" href={`/experience?scene=${store.sceneId}&store=${store.id}`}><IconCube width={16} /> {t("dir.view360")}</Link>
          <Link className="btn btn-ghost !px-3" href={`/stores/${store.slug}`} aria-label={`${t("stores.view")} ${store.name}`}><IconArrow width={16} /></Link>
        </div>
      </div>
    </article></Spotlight>
  );
}
