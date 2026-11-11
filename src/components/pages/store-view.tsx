"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/providers";
import ProductModal from "@/components/product-modal";
import StoreCard from "@/components/store-card";
import { StoreLogo, tint } from "@/components/ui/logo";
import { PortalLink } from "@/components/portal";
import { IconArrow, IconCube, IconMail, IconPhone } from "@/components/ui/icons";
import { Chip } from "./directory";
import Parallax from "@/components/fx/parallax";
import GoldDust from "@/components/fx/gold-dust";
import { ProductCard } from "./product-grid";
import { effectivePrice, getOffersByStore, getProductsByStore, getScene, getStores } from "@/data/service";
import type { CategoryId, Product, Store } from "@/data/types";

/** Each category gets its own composition: hero layout, catalog style and typographic voice. */
const THEME: Record<CategoryId, { hero: "left" | "center" | "split"; catalog: "tall" | "spec" | "menu" | "square" | "wide"; upper: boolean; font?: string; accent?: string }> = {
  fashion: { hero: "left", catalog: "tall", upper: false },
  electronics: { hero: "split", catalog: "spec", upper: true, font: "var(--font-mono-latin), monospace" },
  beauty: { hero: "center", catalog: "square", upper: false },
  jewelry: { hero: "center", catalog: "wide", upper: true },
  home: { hero: "left", catalog: "wide", upper: false },
  dining: { hero: "split", catalog: "menu", upper: false },
  sports: { hero: "left", catalog: "tall", upper: true },
  entertainment: { hero: "split", catalog: "spec", upper: true },
};

export default function StoreView({ store }: { store: Store }) {
  const { t, L, cat, floorName, price, pct } = useApp();
  const th = THEME[store.category];
  const scene = getScene(store.sceneId)!;
  const offers = getOffersByStore(store.id);
  const all = getProductsByStore(store.id);
  const [q, setQ] = useState("");
  const [sale, setSale] = useState(false);
  const [open, setOpen] = useState<Product | null>(null);
  const products = useMemo(() => all.filter((p) => (!sale || p.discountPrice) && (!q.trim() || p.name.en.toLowerCase().includes(q.toLowerCase()) || p.name.ar.includes(q))), [all, q, sale]);
  const similar = useMemo(() => {
    const others = getStores().filter((s) => s.id !== store.id);
    return [...others.filter((s) => s.category === store.category), ...others.filter((s) => s.category !== store.category)].slice(0, 3);
  }, [store]);
  const headStyle = { fontFamily: th.font, textTransform: th.upper ? ("uppercase" as const) : undefined, color: tint(store.color) };

  const cover = (
    <Parallax><img src={store.coverImage} alt={`${store.name} — ${cat(store.category)}`} className="h-full w-full object-cover" fetchPriority="high" /></Parallax>
  );

  return (
    <>
      {/* ---------- hero (varies by category) ---------- */}
      <section className={`relative isolate -mt-16 overflow-hidden md:-mt-20 ${th.hero === "split" ? "" : "min-h-[80svh]"}`}>
        {th.hero === "split" ? (
          <div className="grid min-h-[80svh] md:grid-cols-2">
            <div className="relative min-h-[40svh]">{cover}</div>
            <div className="flex flex-col justify-end gap-6 bg-surface p-8 pb-12 pt-28 md:p-16">
              <StoreLogo name={store.name} monogram={store.monogram} color={store.color} size={64} />
              <h1 className="display-m !text-[clamp(2.4rem,6vw,5.5rem)]" style={headStyle}>{store.name}</h1>
              <p className="thin text-2xl text-fg">{L(store.tagline)}</p>
              <p className="max-w-md text-fg2">{L(store.description)}</p>
            </div>
          </div>
        ) : (
          <>
            {cover}
            <GoldDust className="z-[1]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/50 to-[var(--bg)]/20" />
            <div className={`gutter relative flex min-h-[80svh] flex-col justify-end gap-6 pb-14 pt-32 ${th.hero === "center" ? "items-center text-center" : ""}`}>
              <StoreLogo name={store.name} monogram={store.monogram} color={store.color} size={64} />
              <h1 className="display" style={headStyle}>{store.name}</h1>
              <p className="thin text-2xl text-fg md:text-3xl">{L(store.tagline)}</p>
              <p className="max-w-xl text-fg2">{L(store.description)}</p>
            </div>
          </>
        )}
      </section>

      {/* ---------- facts + CTA ---------- */}
      <section className="gutter grid gap-8 border-b border-line py-10 md:grid-cols-4">
        <div><p className="mono-label mb-2">{cat(store.category)}</p><p>{floorName(store.floorId)} · {L(scene.title)}</p></div>
        <div><p className="mono-label mb-2">{t("store.hours")}</p><p>{L(store.hours)}</p></div>
        <div className="space-y-1"><p className="mono-label mb-2">{t("store.contact")}</p>
          <a className="flex items-center gap-2 hover:text-champagne" href={`tel:${store.contact.phone.replace(/\s/g, "")}`}><IconPhone width={16} /> <span dir="ltr">{store.contact.phone}</span></a>
          <a className="flex items-center gap-2 hover:text-champagne" href={`mailto:${store.contact.email}`}><IconMail width={16} /> {store.contact.email}</a></div>
        <div><p className="mono-label mb-2">{t("store.social")}</p><div className="flex gap-4">
          <a className="hover:text-champagne" href={store.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="hover:text-champagne" href={store.socialLinks.x} target="_blank" rel="noopener noreferrer">X</a></div></div>
      </section>
      <section className="gutter py-10">
        <PortalLink href={`/experience?scene=${store.sceneId}&store=${store.id}`} className="btn btn-solid !min-h-14 !px-8" data-cursor="enter"><IconCube width={18} /> {t("store.enter360")} <IconArrow width={16} /></PortalLink>
      </section>

      {/* ---------- offers ---------- */}
      {offers.length > 0 && (
        <section className="gutter pb-12" aria-labelledby="so">
          <h2 id="so" className="mono-label mb-4 text-champagne">{t("store.offers")}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {offers.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 border p-5" style={{ borderColor: tint(store.color) }}>
                <div><p className="text-lg">{L(o.title)}</p><p className="text-sm text-fg2">{t("offers.valid")} {o.endDate}</p></div>
                <span className="text-4xl font-light" style={{ color: tint(store.color) }}>{pct(o.discount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- catalog ---------- */}
      <section className="gutter py-12" aria-labelledby="cat">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="cat" className="display-m" style={{ textTransform: th.upper ? "uppercase" : undefined }}>{t("store.catalog")}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input className="field !w-48" type="search" value={q} onChange={(e) => setQ(e.target.value.slice(0, 40))} placeholder={t("prod.search")} aria-label={t("prod.search")} />
            <Chip active={sale} onClick={() => setSale(!sale)}>{t("prod.onSale")}</Chip>
          </div>
        </div>
        {products.length === 0 ? <p className="text-fg2">{t("store.noProducts")}</p> : th.catalog === "menu" ? (
          <ul className="mx-auto max-w-3xl divide-y divide-[var(--line)]">
            {products.map((p) => (
              <li key={p.id}><button className="flex w-full items-center gap-5 py-5 text-start" onClick={() => setOpen(p)}>
                <img src={p.images[0]} alt="" className="size-20 object-cover" loading="lazy" />
                <span className="grow"><span className="block text-xl">{L(p.name)}</span><span className="block text-sm text-fg2">{L(p.description)}</span></span>
                <span className="text-xl">{price(effectivePrice(p))}</span></button></li>
            ))}
          </ul>
        ) : th.catalog === "spec" ? (
          <div className="grid gap-px border border-line bg-[var(--line)] md:grid-cols-3">
            {products.map((p) => (
              <button key={p.id} onClick={() => setOpen(p)} className="group flex flex-col gap-4 bg-bg p-5 text-start transition-colors hover:bg-surface">
                <img src={p.images[0]} alt={L(p.name)} loading="lazy" className="aspect-square w-full object-cover" />
                <span className="mono-label" style={{ color: tint(store.color) }}>{String(products.indexOf(p) + 1).padStart(2, "0")} / {p.id.toUpperCase().slice(0, 18)}</span>
                <span className="text-xl">{L(p.name)}</span>
                <span className="font-mono text-sm text-fg2">{price(effectivePrice(p))}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={`grid gap-x-4 gap-y-10 ${th.catalog === "wide" ? "md:grid-cols-3" : "grid-cols-2 md:grid-cols-3"}`}>
            {products.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpen} aspect={th.catalog === "tall" ? "aspect-[3/4]" : th.catalog === "wide" ? "aspect-[4/3]" : "aspect-square"} />)}
          </div>
        )}
      </section>

      {/* ---------- similar ---------- */}
      <section className="gutter py-16">
        <h2 className="mono-label mb-6 text-champagne">{t("store.similar")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <StoreCard key={s.id} store={s} />)}</div>
        <p className="mt-10"><Link href="/stores" className="btn">{t("stores.all")}</Link></p>
      </section>
      <ProductModal product={open} onClose={() => setOpen(null)} />
    </>
  );
}
