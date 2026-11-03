"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DICT, type DictKey } from "@/i18n/dict";
import type { CategoryId, L, Locale } from "@/data/types";

export type Theme = "dark" | "light";

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dir: "ltr" | "rtl";
  t: (k: DictKey) => string;
  L: (v: L) => string;
  cat: (c: CategoryId) => string;
  floorName: (id: string) => string;
  price: (n: number) => string;
  date: (iso: string) => string;
  num: (n: number) => string;
  pct: (n: number) => string;
  theme: Theme;
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
  favOpen: boolean;
  setFavOpen: (o: boolean) => void;
}

const AppContext = createContext<Ctx | null>(null);

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } };

export function AppProviders({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);

  // Hydrate persisted preferences after mount (the inline head script already set <html> attrs to avoid flashing).
  /* eslint-disable react-hooks/set-state-in-effect -- hydrate persisted preferences from localStorage after mount */
  useEffect(() => {
    const l = safeGet("vistra.locale");
    if (l === "ar" || l === "en") setLocaleState(l);
    const th = safeGet("vistra.theme");
    if (th === "light" || th === "dark") setTheme(th);
    try { setFavorites(JSON.parse(safeGet("vistra.favs") || "[]")); } catch { /* ignore */ }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // Global search shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((o) => !o); }
      else if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName ?? "")) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const setLocale = useCallback((l: Locale) => { setLocaleState(l); safeSet("vistra.locale", l); }, []);
  const toggleTheme = useCallback(() => setTheme((t) => { const n = t === "dark" ? "light" : "dark"; safeSet("vistra.theme", n); return n; }), []);
  const toggleFavorite = useCallback((id: string) => setFavorites((f) => { const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id]; safeSet("vistra.favs", JSON.stringify(n)); return n; }), []);

  const value = useMemo<Ctx>(() => {
    const tag = locale === "ar" ? "ar-AE-u-nu-arab" : "en-US";
    const t = (k: DictKey) => DICT[k][locale === "ar" ? 1 : 0];
    return {
      locale, setLocale, dir: locale === "ar" ? "rtl" : "ltr", t,
      L: (v) => v[locale],
      cat: (c) => t(`cat.${c}` as DictKey),
      floorName: (id) => t(`floor.${id}` as DictKey),
      price: (n) => new Intl.NumberFormat(tag, { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n),
      date: (iso) => new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso + "T00:00:00")),
      num: (n) => new Intl.NumberFormat(tag).format(n),
      pct: (n) => `‎−${new Intl.NumberFormat(tag).format(n)}%‎`,
      theme, toggleTheme, favorites, toggleFavorite, searchOpen, setSearchOpen, favOpen, setFavOpen,
    };
  }, [locale, theme, favorites, searchOpen, favOpen, setLocale, toggleTheme, toggleFavorite]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used inside <AppProviders>");
  return c;
}
