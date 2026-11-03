"use client";

import Link from "next/link";
import { useApp } from "./providers";
import Logo from "./ui/logo";
import { getMall } from "@/data/service";

export default function SiteFooter() {
  const { t } = useApp();
  const mall = getMall();
  const col = (title: string, items: [string, string][]) => (
    <div>
      <h3 className="mono-label mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {items.map(([href, label]) => <li key={href}><Link className="text-fg2 transition-colors hover:text-champagne" href={href}>{label}</Link></li>)}
      </ul>
    </div>
  );
  return (
    <footer className="border-t border-line bg-surface">
      <div className="gutter grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-5">
          <Logo size={26} />
          <p className="mono-label !normal-case !tracking-wider">{t("brand.tagline")}</p>
          <p className="text-sm text-fg2">{t("footer.about")}</p>
        </div>
        {col(t("footer.explore"), [["/experience", t("nav.experience")], ["/stores", t("nav.stores")], ["/products", t("nav.products")], ["/offers", t("nav.offers")]])}
        {col(t("footer.company"), [["/about", t("nav.about")], ["/contact", t("nav.contact")]])}
        {col(t("footer.legal"), [["/privacy", t("footer.privacy")], ["/terms", t("footer.terms")]])}
      </div>
      <div className="gutter flex flex-wrap items-center justify-between gap-3 border-t border-line py-6">
        <span className="mono-label">{t("footer.rights")}</span>
        <span className="mono-label" dir="ltr">{mall.coordinates.lat} · {mall.coordinates.lng}</span>
      </div>
    </footer>
  );
}
