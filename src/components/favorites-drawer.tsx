"use client";

import { useState } from "react";
import Dialog from "./ui/dialog";
import ProductModal from "./product-modal";
import { useApp } from "./providers";
import { effectivePrice, getProduct } from "@/data/service";
import type { Product } from "@/data/types";
import { IconHeart } from "./ui/icons";

export default function FavoritesDrawer() {
  const { t, L, price, favorites, toggleFavorite, favOpen, setFavOpen } = useApp();
  const [open, setOpen] = useState<Product | null>(null);
  const items = favorites.map(getProduct).filter(Boolean) as Product[];
  return (
    <>
      <Dialog open={favOpen && !open} onClose={() => setFavOpen(false)} label={t("fav.title")}>
        <div className="p-6">
          <h2 className="display-m mb-6 !text-4xl">{t("fav.title")}</h2>
          {items.length === 0 ? <p className="text-fg2">{t("fav.empty")}</p> : (
            <ul className="grid gap-3">
              {items.map((p) => (
                <li key={p.id} className="flex items-center gap-4 border border-line p-3">
                  <img src={p.images[0]} alt="" className="size-16 object-cover" />
                  <button className="grow text-start" onClick={() => setOpen(p)}>
                    <span className="block">{L(p.name)}</span>
                    <span className="text-sm text-fg2">{price(effectivePrice(p))}</span>
                  </button>
                  <button className="icon-btn" onClick={() => toggleFavorite(p.id)} aria-label={t("prod.unfav")}><IconHeart filled /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Dialog>
      <ProductModal product={open} onClose={() => setOpen(null)} />
    </>
  );
}
