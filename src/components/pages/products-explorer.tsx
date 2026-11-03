"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers";
import ProductModal from "@/components/product-modal";
import Reveal from "@/components/reveal";
import { Chip, PageHeader } from "./directory";
import { ProductCard } from "./product-grid";
import { discountPct, effectivePrice, getCategories, getProducts, getStore, getStores } from "@/data/service";
import type { CategoryId, Product } from "@/data/types";

type Sort = "featured" | "priceAsc" | "priceDesc" | "discount";
const MAX = Math.max(...getProducts().map((p) => p.price));

export default function ProductsExplorer() {
  const { t, L, cat, price } = useApp();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<CategoryId | null>(getCategories().includes(params.get("category") as CategoryId) ? (params.get("category") as CategoryId) : null);
  const [store, setStore] = useState(getStore(params.get("store") ?? "") ? params.get("store")! : "all");
  const [maxPrice, setMaxPrice] = useState(MAX);
  const [sale, setSale] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [open, setOpen] = useState<Product | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const out = getProducts().filter((p) =>
      (!category || p.category === category) && (store === "all" || p.storeId === store) && effectivePrice(p) <= maxPrice && (!sale || p.discountPrice) &&
      (!s || p.name.en.toLowerCase().includes(s) || p.name.ar.includes(s) || getStore(p.storeId)!.name.toLowerCase().includes(s)));
    if (sort === "priceAsc") out.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (sort === "priceDesc") out.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    if (sort === "discount") out.sort((a, b) => discountPct(b) - discountPct(a));
    return out;
  }, [q, category, store, maxPrice, sale, sort]);

  const dirty = q || category || store !== "all" || maxPrice < MAX || sale;
  const clear = () => { setQ(""); setCategory(null); setStore("all"); setMaxPrice(MAX); setSale(false); };

  return (
    <>
      <PageHeader kicker="VISTRA® / 03" title={t("prod.title")} />
      <section className="gutter grid gap-10 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-7 lg:sticky lg:top-28 lg:self-start" aria-label="Filters">
          <label className="block"><span className="mono-label">{t("prod.search")}</span><input className="field" type="search" value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))} /></label>
          <div><p className="mono-label mb-3">{t("dir.category")}</p><div className="flex flex-wrap gap-2"><Chip active={!category} onClick={() => setCategory(null)}>{t("cat.all")}</Chip>{getCategories().map((c) => <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>{cat(c)}</Chip>)}</div></div>
          <label className="block"><span className="mono-label">{t("prod.store")}</span>
            <select className="field" value={store} onChange={(e) => setStore(e.target.value)}><option value="all">{t("prod.allStores")}</option>{getStores().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label className="block"><span className="mono-label">{t("prod.maxPrice")}: {price(maxPrice)}</span>
            <input type="range" min={5} max={MAX} step={5} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="mt-3 w-full accent-[var(--champagne)]" /></label>
          <Chip active={sale} onClick={() => setSale(!sale)}>{t("prod.onSale")}</Chip>
          <label className="block"><span className="mono-label">{t("prod.sort")}</span>
            <select className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">{t("prod.sort.featured")}</option><option value="priceAsc">{t("prod.sort.priceAsc")}</option><option value="priceDesc">{t("prod.sort.priceDesc")}</option><option value="discount">{t("prod.sort.discount")}</option></select></label>
          {dirty && <button className="btn w-full" onClick={clear}>{t("dir.clear")}</button>}
        </aside>
        <div>
          <p className="mono-label mb-6" aria-live="polite">{list.length} {t("prod.count")}</p>
          {list.length === 0 ? (
            <div className="grid min-h-64 place-items-center border border-dashed border-line p-10 text-center"><div className="space-y-4"><p className="text-fg2">{t("prod.empty")}</p><button className="btn" onClick={clear}>{t("dir.clear")}</button></div></div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">{list.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 0.05} y={24}><ProductCard product={p} onOpen={setOpen} /></Reveal>)}</div>
          )}
        </div>
      </section>
      <ProductModal product={open} onClose={() => setOpen(null)} />
      <span className="sr-only">{open && L(open.name)}</span>
    </>
  );
}
