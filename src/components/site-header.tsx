"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./providers";
import Logo from "./ui/logo";
import Magnetic from "./ui/magnetic";
import { IconClose, IconHeart, IconMenu, IconMoon, IconSearch, IconSun } from "./ui/icons";
import type { DictKey } from "@/i18n/dict";

const LINKS: { href: string; key: DictKey }[] = [
  { href: "/stores", key: "nav.stores" },
  { href: "/products", key: "nav.products" },
  { href: "/offers", key: "nav.offers" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export default function SiteHeader() {
  const { t, locale, setLocale, theme, toggleTheme, setSearchOpen, favorites, setFavOpen } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hide, setHide] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setOpen(false); } // close the mobile menu after navigating
  useEffect(() => {
    let last = window.scrollY;
    const h = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (y > last + 6 && y > 140) setHide(true);
      else if (y < last - 6 || y < 80) setHide(false);
      last = y;
    };
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => {
    const on = hide && !open;
    if (on) document.documentElement.dataset.hdr = "hidden"; else delete document.documentElement.dataset.hdr;
    return () => { delete document.documentElement.dataset.hdr; };
  }, [hide, open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:bg-champagne focus:px-4 focus:py-2 focus:text-[var(--on-accent)]">{t("nav.skip")}</a>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,transform] duration-300 ${hide && !open ? "max-lg:-translate-y-full" : ""} ${solid || open || pathname !== "/" ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent"}`}>
        <div className="gutter flex h-16 items-center justify-between gap-2 md:h-20">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                className={`mono-label transition-colors hover:text-fg ${pathname.startsWith(l.href) ? "!text-champagne" : ""}`}>{t(l.key)}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label={t("a11y.search")}><IconSearch /></button>
            <button className="icon-btn relative hidden sm:grid" onClick={() => setFavOpen(true)} aria-label={t("a11y.favorites")}>
              <IconHeart filled={favorites.length > 0} />
              {favorites.length > 0 && <span className="absolute -end-1 -top-1 grid size-4 place-items-center rounded-full bg-champagne text-[10px] font-semibold text-[var(--on-accent)]">{favorites.length}</span>}
            </button>
            <button className="icon-btn hidden sm:grid" onClick={toggleTheme} aria-label={t("a11y.theme")}>{theme === "dark" ? <IconSun /> : <IconMoon />}</button>
            <button className="icon-btn !w-auto px-2.5 font-mono text-xs" onClick={() => setLocale(locale === "en" ? "ar" : "en")} aria-label={t("a11y.language")} lang={locale === "en" ? "ar" : "en"}>
              {t("lang.switch")}
            </button>
            <span className="hidden md:inline">
              <Magnetic><Link href="/experience" className="btn btn-solid" data-cursor="enter">{t("nav.experience")}</Link></Magnetic>
            </span>
            <button className="icon-btn lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t("nav.close") : t("nav.menu")}>
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div id="mobile-nav" className="fixed inset-0 z-40 flex flex-col gap-1 overflow-y-auto bg-bg px-6 pb-10 pt-24 lg:hidden">
          <Link href="/experience" className="vx-rise display-m border-b border-line py-4 !text-5xl text-champagne">{t("nav.experience")}</Link>
          {LINKS.map((l, i) => <Link key={l.href} href={l.href} style={{ animationDelay: `${(i + 1) * 70}ms` }} className="vx-rise display-m border-b border-line py-4 !text-4xl">{t(l.key)}</Link>)}
          <div className="mt-6 flex gap-2 sm:hidden">
            <button className="btn grow" onClick={() => { setOpen(false); setFavOpen(true); }}><IconHeart filled={favorites.length > 0} width={16} /> {t("a11y.favorites")}{favorites.length > 0 ? ` (${favorites.length})` : ""}</button>
            <button className="btn grow" onClick={toggleTheme}>{theme === "dark" ? <IconSun width={16} /> : <IconMoon width={16} />} {t("a11y.theme")}</button>
          </div>
        </div>
      )}
    </>
  );
}
