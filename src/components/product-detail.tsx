"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "./providers";
import { discountPct, effectivePrice, getStore, getProducts } from "@/data/service";
import type { Product } from "@/data/types";
import { IconHeart, IconMail, IconCube, IconArrow } from "./ui/icons";
import { StoreLogo } from "./ui/logo";
import ZoomImage from "./fx/zoom-image";
import ShareButton from "./share-button";

/** Small contact form (demo: validated locally, not sent anywhere). */
function ContactStore({ storeName }: { storeName: string }) {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState<{ email?: string; msg?: string }>({});
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = t("val.email");
    if (msg.trim().length < 10) next.msg = t("val.min");
    setErr(next);
    if (!Object.keys(next).length) setDone(true);
  };

  if (done) return <p role="status" className="border border-line p-4 text-sm text-fg2">{t("contact.ok")}</p>;
  return (
    <form onSubmit={submit} noValidate className="space-y-3 border border-line p-4" aria-label={`${t("prod.contact")} — ${storeName}`}>
      <label className="block">
        <span className="mono-label">{t("contact.email")}</span>
        <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err.email} autoComplete="email" />
        {err.email && <span role="alert" className="text-xs text-[#ff6b6b]">{err.email}</span>}
      </label>
      <label className="block">
        <span className="mono-label">{t("contact.message")}</span>
        <textarea className="field min-h-20" value={msg} onChange={(e) => setMsg(e.target.value.slice(0, 600))} aria-invalid={!!err.msg} />
        {err.msg && <span role="alert" className="text-xs text-[#ff6b6b]">{err.msg}</span>}
      </label>
      <button className="btn btn-solid w-full" type="submit">{t("contact.send")}</button>
      <p className="text-[11px] text-fg3">{t("contact.demo")}</p>
    </form>
  );
}

export default function ProductDetail({ product, layout = "split", onNavigate }: { product: Product; layout?: "split" | "stack"; onNavigate?: () => void }) {
  const { t, L, price, favorites, toggleFavorite, pct } = useApp();
  const [variant, setVariant] = useState(0);
  const [contact, setContact] = useState(false);
  const store = getStore(product.storeId)!;
  const fav = favorites.includes(product.id);
  const off = discountPct(product);

  return (
    <div className={layout === "split" ? "grid md:grid-cols-2" : "grid"}>
      <div className="relative aspect-square bg-surface">
        <ZoomImage src={product.images[0]} alt={L(product.name)} glow={product.variants[variant]?.swatch} className="h-full w-full" />
        {off > 0 && <span className="mono-label absolute start-3 top-3 bg-champagne px-2 py-1 text-[var(--on-accent)]">{pct(off)}</span>}
      </div>
      <div className="flex flex-col gap-5 p-6 md:p-8">
        <Link href={`/stores/${store.slug}`} onClick={onNavigate} className="inline-flex items-center gap-3 self-start">
          <StoreLogo name={store.name} monogram={store.monogram} color={store.color} size={34} />
          <span className="mono-label">{store.name}</span>
        </Link>
        <h2 className="text-3xl font-medium leading-tight tracking-tight">{L(product.name)}</h2>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl">{price(effectivePrice(product))}</span>
          {product.discountPrice && <span className="text-fg3 line-through">{price(product.price)}</span>}
        </div>
        <p className="text-fg2">{L(product.description)}</p>
        <fieldset>
          <legend className="mono-label mb-2">{t("prod.variant")}</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <button key={i} type="button" aria-pressed={variant === i} onClick={() => setVariant(i)}
                className={`flex items-center gap-2 border px-3 py-2 text-sm ${variant === i ? "border-champagne" : "border-line"}`}>
                <span className="size-3.5 rounded-full border border-line" style={{ background: v.swatch }} />
                {L(v.name)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-auto flex flex-wrap gap-2">
          <Link className="btn btn-solid grow" href={`/stores/${store.slug}`} onClick={onNavigate}>{t("prod.inStore")} <IconArrow width={16} /></Link>
          <button className="btn grow" onClick={() => setContact((c) => !c)} aria-expanded={contact}><IconMail width={16} /> {t("prod.contact")}</button>
          <ShareButton title={L(product.name)} className="btn !px-4" />
          <button className="icon-btn" style={{ width: "3rem", height: "3rem" }} aria-pressed={fav} onClick={() => toggleFavorite(product.id)} aria-label={fav ? t("prod.unfav") : t("prod.fav")} title={fav ? t("prod.unfav") : t("prod.fav")}>
            <IconHeart filled={fav} />
          </button>
        </div>
        {contact && <ContactStore storeName={store.name} />}
        <Link className="mono-label inline-flex items-center gap-2 text-champagne" href={`/experience?scene=${product.sceneId}&product=${product.id}`} onClick={onNavigate}>
          <IconCube width={16} /> {t("prod.in360")}
        </Link>
        <p className="text-[11px] text-fg3">{t("prod.demoNote")}</p>
      </div>
    </div>
  );
}

export function RelatedProducts({ product, onPick }: { product: Product; onPick: (p: Product) => void }) {
  const { t, L, price } = useApp();
  const rel = getProducts().filter((p) => p.id !== product.id && (p.storeId === product.storeId || p.category === product.category)).slice(0, 4);
  if (!rel.length) return null;
  return (
    <div className="border-t border-line p-6 md:p-8">
      <h3 className="mono-label mb-4">{t("prod.related")}</h3>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {rel.map((p) => (
          <li key={p.id}>
            <button className="block w-full text-start" onClick={() => onPick(p)}>
              <img src={p.images[0]} alt="" className="aspect-square w-full object-cover" loading="lazy" />
              <span className="mt-2 block truncate text-sm">{L(p.name)}</span>
              <span className="text-xs text-fg2">{price(effectivePrice(p))}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
