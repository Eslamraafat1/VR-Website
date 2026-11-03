"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/providers";
import Dialog from "@/components/ui/dialog";
import OfferCard from "@/components/offer-card";
import Reveal from "@/components/reveal";
import { PortalLink } from "@/components/portal";
import { IconArrow, IconCube } from "@/components/ui/icons";
import { Chip, PageHeader } from "./directory";
import { getCategories, getOffers, getProduct, getStore } from "@/data/service";
import type { CategoryId, Offer } from "@/data/types";

const all = getOffers();

export default function OffersView() {
  const { t, L, cat, price, date, pct } = useApp();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [open, setOpen] = useState<Offer | null>(null);
  const campaign = all[0];
  const list = useMemo(() => all.filter((o) => !category || getStore(o.storeId)!.category === category), [category]);
  const store = open && getStore(open.storeId)!;
  const product = open?.productId ? getProduct(open.productId) : undefined;

  return (
    <>
      <section className="relative -mt-16 isolate min-h-[85svh] overflow-hidden md:-mt-20">
        <img src={campaign.image} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-[var(--bg)]/10" />
        <div className="gutter relative flex min-h-[85svh] flex-col justify-end gap-6 pb-14 pt-32">
          <p className="mono-label text-champagne">{t("offers.campaign")} · 2026</p>
          <h1 className="display" lang="en">{t("offers.seasonal")}</h1>
          <p className="thin max-w-xl text-xl">{t("offers.seasonalText")}</p>
          <div className="flex items-center gap-6"><span className="text-7xl font-extralight text-champagne md:text-9xl">{pct(campaign.discount)}</span><span className="mono-label">{t("offers.valid")} {date(campaign.endDate)}</span></div>
          <div><PortalLink href="/experience?scene=beauty&store=maison-eclat" className="btn btn-solid" data-cursor="enter">{t("offers.inStore")} <IconArrow width={16} /></PortalLink></div>
        </div>
      </section>

      <PageHeader kicker="VISTRA® / 04" title={t("offers.pageTitle")}>
        <div className="mt-8 flex flex-wrap gap-2"><Chip active={!category} onClick={() => setCategory(null)}>{t("cat.all")}</Chip>{getCategories().map((c) => <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>{cat(c)}</Chip>)}</div>
      </PageHeader>
      <section className="gutter py-10">
        {list.length === 0 ? <p className="text-fg2">{t("offers.empty")}</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((o, i) => <Reveal key={o.id} delay={(i % 3) * 0.06} y={24}><OfferCard offer={o} onOpen={setOpen} /></Reveal>)}</div>
        )}
      </section>

      <Dialog open={!!open} onClose={() => setOpen(null)} label={open ? L(open.title) : ""} wide>
        {open && store && (
          <div className="grid md:grid-cols-2">
            <img src={product && !open.campaign ? product.images[0] : open.image} alt={L(open.title)} className="aspect-square w-full object-cover md:aspect-auto md:h-full" />
            <div className="flex flex-col gap-4 p-8">
              <p className="mono-label text-champagne">{store.name}</p>
              <h2 className="text-3xl font-medium">{L(open.title)}</h2>
              <p className="text-6xl font-light text-champagne">{pct(open.discount)}</p>
              <p className="text-fg2">{L(open.description)}</p>
              {product && <p className="text-xl">{price(product.discountPrice ?? Math.round(product.price * (1 - open.discount / 100)))} <span className="text-fg3 line-through">{price(product.price)}</span></p>}
              <p className="mono-label">{date(open.startDate)} → {date(open.endDate)}</p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Link className="btn btn-solid grow" href={`/experience?scene=${store.sceneId}&store=${store.id}${product ? `&product=${product.id}` : ""}`}><IconCube width={16} /> {t("offers.inStore")}</Link>
                <Link className="btn grow" href={product ? `/products/${product.slug}` : `/stores/${store.slug}`}>{t("offers.view")}</Link>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
