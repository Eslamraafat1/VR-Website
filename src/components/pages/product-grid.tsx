"use client";

import Link from "next/link";
import { useApp } from "@/components/providers";
import { IconCube, IconHeart } from "@/components/ui/icons";
import { discountPct, effectivePrice, getStore } from "@/data/service";
import type { Product } from "@/data/types";

export function ProductCard({ product, onOpen, aspect = "aspect-square" }: { product: Product; onOpen: (p: Product) => void; aspect?: string }) {
  const { t, L, price, favorites, toggleFavorite, pct } = useApp();
  const off = discountPct(product);
  const fav = favorites.includes(product.id);
  const store = getStore(product.storeId)!;
  return (
    <article className="group relative flex flex-col">
      <button className={`relative block w-full overflow-hidden bg-surface ${aspect}`} onClick={() => onOpen(product)} aria-label={`${t("prod.open")}: ${L(product.name)}`} data-cursor="view">
        <img src={product.images[0]} alt={L(product.name)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {off > 0 && <span className="mono-label absolute start-3 top-3 bg-champagne px-2 py-1 !text-[var(--on-accent)]">{pct(off)}</span>}
        {product.newArrival && !off && <span className="mono-label absolute start-3 top-3 bg-fg px-2 py-1 !text-[var(--bg)]">{t("prod.new")}</span>}
      </button>
      <button className="icon-btn absolute end-3 top-3" aria-pressed={fav} onClick={() => toggleFavorite(product.id)} aria-label={fav ? t("prod.unfav") : t("prod.fav")}><IconHeart filled={fav} width={18} /></button>
      <div className="flex flex-1 flex-col gap-1 pt-3">
        <p className="mono-label !text-fg3">{store.name}</p>
        <h3 className="font-medium">{L(product.name)}</h3>
        <p className="flex items-baseline gap-2 text-sm"><span>{price(effectivePrice(product))}</span>{product.discountPrice && <span className="text-fg3 line-through">{price(product.price)}</span>}</p>
        <Link className="mono-label mt-1 inline-flex items-center gap-1.5 !text-champagne" href={`/experience?scene=${product.sceneId}&product=${product.id}`}><IconCube width={14} /> {t("prod.in360")}</Link>
      </div>
    </article>
  );
}
