"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers";
import StoreCard from "@/components/store-card";
import Reveal from "@/components/reveal";
import FilterPanel from "@/components/filter-panel";
import { getCategories, getFloors, getOffersByStore, getStores } from "@/data/service";
import type { CategoryId } from "@/data/types";

export function PageHeader({ kicker, title, children }: { kicker?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="gutter border-b border-line pb-10 pt-16 md:pt-24">
      {kicker && <p className="mono-label mb-4 text-champagne">{kicker}</p>}
      <h1 className="display-m !text-[clamp(2.6rem,7vw,6.5rem)]">{title}</h1>
      {children}
    </header>
  );
}

export const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} aria-pressed={active} className={`vx-press mono-label inline-flex min-h-10 items-center border px-3 py-2 transition-colors ${active ? "border-champagne bg-champagne !text-[var(--on-accent)]" : "border-line hover:border-fg"}`}>{children}</button>
);

export default function StoreDirectory() {
  const { t, cat, floorName } = useApp();
  const params = useSearchParams();
  const initial = params.get("category");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(getCategories().includes(initial as CategoryId) ? (initial as CategoryId) : null);
  const [floor, setFloor] = useState<string>("all");
  const [featured, setFeatured] = useState(false);
  const [withOffers, setWithOffers] = useState(false);

  const list = useMemo(() => getStores().filter((s) =>
    (!category || s.category === category) &&
    (floor === "all" || s.floorId === floor) &&
    (!featured || s.featured) &&
    (!withOffers || getOffersByStore(s.id).length > 0) &&
    (!q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()) || cat(s.category).toLowerCase().includes(q.trim().toLowerCase()))
  ), [q, category, floor, featured, withOffers, cat]);

  const dirty = q || category || floor !== "all" || featured || withOffers;
  const clear = () => { setQ(""); setCategory(null); setFloor("all"); setFeatured(false); setWithOffers(false); };

  return (
    <>
      <PageHeader kicker="VISTRA® / 02" title={t("dir.title")} />
      <section className="gutter grid gap-6 py-6 lg:grid-cols-[280px_1fr] lg:gap-10 lg:py-10">
        <FilterPanel active={[q, category, floor !== "all", featured, withOffers].filter(Boolean).length} count={list.length}>
          <label className="block"><span className="mono-label">{t("dir.search")}</span>
            <input className="field" type="search" value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))} placeholder="ATELIER, ORBIT…" /></label>
          <div><p className="mono-label mb-3">{t("dir.category")}</p>
            <div className="flex flex-wrap gap-2"><Chip active={!category} onClick={() => setCategory(null)}>{t("cat.all")}</Chip>
              {getCategories().map((c) => <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>{cat(c)}</Chip>)}</div></div>
          <div><p className="mono-label mb-3">{t("dir.floor")}</p>
            <div className="flex flex-wrap gap-2"><Chip active={floor === "all"} onClick={() => setFloor("all")}>{t("floor.all")}</Chip>
              {getFloors().map((f) => <Chip key={f.id} active={floor === f.id} onClick={() => setFloor(f.id)}>{floorName(f.id)}</Chip>)}</div></div>
          <div className="flex flex-wrap gap-2"><Chip active={featured} onClick={() => setFeatured(!featured)}>{t("dir.featured")}</Chip><Chip active={withOffers} onClick={() => setWithOffers(!withOffers)}>{t("dir.onlyOffers")}</Chip></div>
          {dirty && <button className="btn w-full" onClick={clear}>{t("dir.clear")}</button>}
        </FilterPanel>
        <div>
          <p className="mono-label mb-4 max-lg:hidden lg:mb-6" aria-live="polite">{list.length} {t("dir.count")}</p>
          {list.length === 0 ? (
            <div className="grid min-h-64 place-items-center border border-dashed border-line p-10 text-center"><div className="space-y-4"><p className="text-fg2">{t("dir.empty")}</p><button className="btn" onClick={clear}>{t("dir.clear")}</button></div></div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map((s, i) => <Reveal key={s.id} delay={(i % 3) * 0.06} y={24}><StoreCard store={s} /></Reveal>)}</div>
          )}
        </div>
      </section>
    </>
  );
}
