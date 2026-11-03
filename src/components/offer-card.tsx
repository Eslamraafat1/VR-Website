"use client";

import Link from "next/link";
import { useApp } from "./providers";
import { StoreLogo } from "./ui/logo";
import { IconArrow } from "./ui/icons";
import { getProduct, getStore } from "@/data/service";
import type { Offer } from "@/data/types";

export default function OfferCard({ offer, onOpen }: { offer: Offer; onOpen?: (o: Offer) => void }) {
  const { t, L, price, date, pct } = useApp();
  const store = getStore(offer.storeId)!;
  const product = offer.productId ? getProduct(offer.productId) : undefined;
  const img = product && !offer.campaign ? product.images[0] : offer.image;
  const original = product?.price;
  const discounted = original ? Math.round(original * (1 - offer.discount / 100)) : undefined;
  const sale = product?.discountPrice && !offer.campaign ? product.discountPrice : discounted;

  return (
    <article id={offer.id} className="group flex flex-col border border-line bg-surface" data-cursor="view">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={product ? L(product.name) : L(offer.title)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute start-0 top-0 bg-champagne px-3 py-2 text-lg font-semibold text-[var(--on-accent)]">{pct(offer.discount)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={`/stores/${store.slug}`} className="inline-flex items-center gap-2 self-start">
          <StoreLogo name={store.name} monogram={store.monogram} color={store.color} size={28} />
          <span className="mono-label">{store.name}</span>
        </Link>
        <h3 className="text-xl font-medium leading-tight">{L(offer.title)}</h3>
        {original && sale ? (
          <p className="flex items-baseline gap-3"><span className="text-xl">{price(sale)}</span><span className="text-fg3 line-through">{price(original)}</span></p>
        ) : <p className="text-sm text-fg2">{L(offer.description)}</p>}
        <p className="mono-label !text-fg3">{t("offers.valid")} {date(offer.endDate)}</p>
        <div className="mt-auto pt-2">
          {onOpen ? (
            <button className="btn w-full" onClick={() => onOpen(offer)}>{t("offers.view")} <IconArrow width={16} /></button>
          ) : (
            <Link className="btn w-full" href={product ? `/products/${product.slug}` : `/stores/${store.slug}`}>{t("offers.view")} <IconArrow width={16} /></Link>
          )}
        </div>
      </div>
    </article>
  );
}
