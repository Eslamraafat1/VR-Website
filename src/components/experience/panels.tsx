"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "@/components/providers";
import ProductDetail from "@/components/product-detail";
import { StoreLogo } from "@/components/ui/logo";
import { IconArrow, IconClose, IconPin } from "@/components/ui/icons";
import { getOffersByStore, getScene, getStore, getProduct } from "@/data/service";

/** Slide-in side panel (bottom sheet on mobile). Closing never touches the panorama. */
export function SidePanel({ open, onClose, label, children, wide }: { open: boolean; onClose: () => void; label: string; children: ReactNode; wide?: boolean }) {
  const { t } = useApp();
  return (
    <aside
      role="dialog" aria-label={label} aria-hidden={!open} inert={!open}
      className={`xp-panel fixed z-30 overflow-y-auto border-line bg-bg/95 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]
        inset-x-0 bottom-0 max-h-[78vh] border-t
        md:inset-y-0 md:end-0 md:start-auto md:max-h-none md:border-t-0 md:border-s ${wide ? "md:w-[480px]" : "md:w-[420px]"}
        ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full md:rtl:-translate-x-full"}`}
    >
      <button className="icon-btn absolute end-3 top-3 z-10" onClick={onClose} aria-label={t("xp.closePanel")}><IconClose /></button>
      {open && children}
    </aside>
  );
}

export function StorePanel({ storeId, onShowOnMap }: { storeId: string; onShowOnMap: () => void }) {
  const { t, L, cat, floorName, price, pct } = useApp();
  const s = getStore(storeId);
  if (!s) return null;
  const scene = getScene(s.sceneId);
  const offer = getOffersByStore(s.id)[0];
  return (
    <div>
      <img src={s.coverImage} alt={s.name} className="aspect-[16/9] w-full object-cover" />
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-4">
          <StoreLogo name={s.name} monogram={s.monogram} color={s.color} size={52} />
          <div>
            <h2 className="text-2xl font-medium leading-tight">{s.name}</h2>
            <p className="mono-label">{cat(s.category)}</p>
          </div>
        </div>
        <p className="text-fg2">{L(s.description)}</p>
        <dl className="grid grid-cols-2 gap-4 border-y border-line py-4 text-sm">
          <div><dt className="mono-label mb-1">{t("store.hours")}</dt><dd>{L(s.hours)}</dd></div>
          <div><dt className="mono-label mb-1">{t("store.location")}</dt><dd>{floorName(s.floorId)} · {scene && L(scene.title)}</dd></div>
        </dl>
        {offer && (
          <div className="flex items-center justify-between gap-3 border border-champagne p-4">
            <div><p className="mono-label text-champagne">{t("store.offers")}</p><p className="mt-1">{L(offer.title)}</p></div>
            <span className="text-2xl text-champagne">{pct(offer.discount)}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Link href={`/stores/${s.slug}`} className="btn btn-solid grow">{t("xp.enterStore")} <IconArrow width={16} /></Link>
          <button className="btn grow" onClick={onShowOnMap}><IconPin width={16} /> {t("xp.map")}</button>
        </div>
        <p className="sr-only">{price(0)}</p>
      </div>
    </div>
  );
}

export function ProductPanel({ productId }: { productId: string }) {
  const p = getProduct(productId);
  if (!p) return null;
  return <div className="pt-0"><ProductDetail product={p} layout="stack" /></div>;
}

export function InfoPanel({ sceneId, infoId }: { sceneId: string; infoId: string }) {
  const { L, t } = useApp();
  const info = getScene(sceneId)?.info.find((i) => i.id === infoId);
  if (!info) return null;
  return (
    <div className="space-y-4 p-6 pt-16">
      <p className="mono-label text-champagne">{t("xp.info")}</p>
      <h2 className="text-3xl font-medium">{L(info.title)}</h2>
      <p className="text-fg2">{L(info.text)}</p>
    </div>
  );
}
