"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Dialog from "./ui/dialog";
import { IconClose, IconSearch } from "./ui/icons";
import { useApp } from "./providers";
import { search, type SearchHit } from "@/data/service";
import type { DictKey } from "@/i18n/dict";

const GROUPS: SearchHit["type"][] = ["store", "product", "category", "location", "offer"];
const GROUP_KEY: Record<SearchHit["type"], DictKey> = { store: "search.stores", product: "search.products", category: "search.categories", location: "search.locations", offer: "search.offers" };

export default function SearchOverlay() {
  const { t, locale, cat, floorName, searchOpen, setSearchOpen } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => search(q, locale, { category: cat, floor: floorName }), [q, locale, cat, floorName]);
  const ordered = useMemo(() => GROUPS.flatMap((g) => hits.filter((h) => h.type === g).slice(0, 5)), [hits]);

  useEffect(() => {
    if (!searchOpen) return;
    const id = window.setTimeout(() => input.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [searchOpen]);

  const close = () => { setSearchOpen(false); setQ(""); setActive(0); };
  const go = (h: SearchHit) => {
    close();
    // inside the virtual mall, results move the visitor instead of leaving the experience
    if (pathname.startsWith("/experience") && h.scene) window.dispatchEvent(new CustomEvent("vistra:nav", { detail: { scene: h.scene, store: h.store, product: h.product } }));
    else router.push(h.href);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, ordered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && ordered[active]) { e.preventDefault(); go(ordered[active]); }
  };

  return (
    <Dialog open={searchOpen} onClose={close} label={t("a11y.search")}>
      <div onKeyDown={onKey} className="min-h-[50vh]">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 pe-16">
          <IconSearch className="text-champagne" />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value.slice(0, 80)); setActive(0); }} placeholder={t("search.placeholder")}
            className="w-full bg-transparent text-lg outline-none placeholder:text-fg3" role="combobox" aria-expanded={ordered.length > 0} aria-controls="search-results" aria-label={t("a11y.search")} />
          {q && <button className="icon-btn" onClick={() => { setQ(""); input.current?.focus(); }} aria-label={t("search.clear")}><IconClose width={16} /></button>}
        </div>
        <div id="search-results" role="listbox" className="max-h-[60vh] overflow-auto p-3">
          {!q && <p className="p-4 text-sm text-fg3">{t("search.hint")}</p>}
          {q && ordered.length === 0 && <p className="p-4 text-fg2">{t("search.empty")} “{q}”</p>}
          {GROUPS.map((g) => {
            const items = hits.filter((h) => h.type === g).slice(0, 5);
            if (!items.length) return null;
            return (
              <div key={g} className="mb-3">
                <h3 className="mono-label px-3 py-2">{t(GROUP_KEY[g])}</h3>
                {items.map((h) => {
                  const my = ordered.indexOf(h);
                  return (
                    <button key={h.type + h.id} role="option" aria-selected={active === my} onMouseEnter={() => setActive(my)} onClick={() => go(h)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-start ${active === my ? "bg-surface2" : ""}`}>
                      {h.image ? <img src={h.image} alt="" className="size-11 shrink-0 object-cover" /> : <span className="grid size-11 shrink-0 place-items-center border border-line text-champagne">#</span>}
                      <span className="min-w-0 grow">
                        <span className="block truncate">{h.title}</span>
                        {h.sub && <span className="block truncate text-xs text-fg2">{h.sub}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
