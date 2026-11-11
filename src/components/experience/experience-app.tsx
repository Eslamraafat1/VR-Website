"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import PanoViewer, { type PanoHandle, type PanoStatus } from "./pano-viewer";
import FloorMap from "./floor-map";
import { InfoPanel, ProductPanel, SidePanel, StorePanel } from "./panels";
import HotspotEditor from "./hotspot-editor";
import GoldDust from "@/components/fx/gold-dust";
import Logo from "@/components/ui/logo";
import { useApp } from "@/components/providers";
import { IconArrow, IconClose, IconCompass, IconFullscreen, IconGyro, IconInfo, IconMap, IconMinus, IconMoon, IconPlay, IconPlus, IconSearch, IconSound, IconSun } from "@/components/ui/icons";
import { ambientStart, ambientStop } from "@/lib/ambient";
import { arrivalYaw, findRoute, getCategories, getFloors, getHotspots, getScene, getScenesByFloor, getStore, getStores } from "@/data/service";
import type { CategoryId, Hotspot } from "@/data/types";

type Panel = { kind: "store" | "product" | "info"; id: string } | null;
const FLOOR_ENTRY: Record<string, string> = { ground: "atrium", first: "beauty" };
const TOUR_STOPS = ["entrance", "atrium", "fashion", "electronics", "luxury", "cafe", "beauty", "home", "sports", "dining", "lounge"];
const TOUR_PATH = TOUR_STOPS.flatMap((id, i) => (i === 0 ? [id] : findRoute(TOUR_STOPS[i - 1], id).slice(1)));
const GLANCE_MS = 2300;

export default function ExperienceApp() {
  const params = useSearchParams();
  const { t, L, locale, setLocale, theme, toggleTheme, floorName, cat, setSearchOpen } = useApp();
  const debug = params.get("debug") === "1";

  const initialScene = getScene(params.get("scene") ?? "") ? params.get("scene")! : "entrance";
  const [sceneId, setSceneId] = useState(initialScene);
  const [yaw, setYaw] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<PanoStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [transition, setTransition] = useState<{ title: string; floor: string; thumb?: string } | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [miniOpen, setMiniOpen] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [gyroOn, setGyroOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ yaw: number; pitch: number } | null>(null);
  const [route, setRoute] = useState<string[]>([]);
  const [mapFloor, setMapFloor] = useState(getScene(initialScene)!.floorId);
  const [mapStore, setMapStore] = useState<string | null>(null);
  const [mapCat, setMapCat] = useState<CategoryId | null>(null);
  const [mapQuery, setMapQuery] = useState("");
  const [pendingPanel, setPendingPanel] = useState<{ panel: NonNullable<Panel>; hotspot?: string } | null>(() => {
    const p = params.get("product"), st = params.get("store");
    if (p) return { panel: { kind: "product", id: p }, hotspot: `product:${p}` };
    if (st) return { panel: { kind: "store", id: st }, hotspot: `store:${st}` };
    return null;
  });
  const [tourIdx, setTourIdx] = useState<number | null>(null);
  const [tourCaption, setTourCaption] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [drafts, setDrafts] = useState<Hotspot[]>([]);
  const [placing, setPlacing] = useState<string | null>(null);

  const handle = useRef<PanoHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const scene = getScene(sceneId)!;
  const floors = getFloors();

  const hotspots = useMemo(() => [...getHotspots(sceneId), ...drafts.filter((d) => d.sceneId === sceneId)], [sceneId, drafts]);

  // ---- entrance choreography: controls reveal in sequence
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".xp-ui", { opacity: 0, y: 14, duration: 0.6, stagger: 0.08, delay: 0.35, ease: "power3.out", clearProps: "all" });
    }, root);
    return () => ctx.revert();
  }, []);

  const flash = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 2600); };

  // ---- navigation between scenes (branded transition, honest about failures)
  const navigate = useCallback((to: string, opts: { panel?: Panel; focusHotspot?: string } = {}) => {
    const dest = getScene(to);
    if (!dest) return;
    if (to === sceneId) {
      if (opts.panel) setPanel(opts.panel);
      return;
    }
    setPanel(null); setActiveId(null);
    transitioning.current = true;
    setTransition({ title: L(dest.title), floor: floorName(dest.floorId), thumb: dest.thumbnail });
    window.setTimeout(() => {
      setYaw(arrivalYaw(sceneId, to));
      setSceneId(to);
      setMapFloor(dest.floorId);
      setFocus(null);
      window.history.replaceState(null, "", `/experience?scene=${to}${debug ? "&debug=1" : ""}`);
      if (opts.panel) {
        const p = opts.panel;
        setPendingPanel({ panel: p, hotspot: opts.focusHotspot });
      }
    }, 380);
  }, [sceneId, L, floorName, debug]);

  /** user-initiated navigation: ends any running tour */
  const goTo = useCallback((to: string, opts: { panel?: Panel; focusHotspot?: string } = {}) => {
    setTourIdx(null); setTourCaption(null);
    navigate(to, opts);
  }, [navigate]);

  // ---- guided tour: visit every space, glancing at up to three stores in each
  useEffect(() => {
    if (tourIdx === null || status !== "ready" || transition || sceneId !== TOUR_PATH[tourIdx]) return;
    const stores = hotspots.filter((h) => h.kind === "store").slice(0, 3);
    const timers: number[] = stores.map((h, i) => window.setTimeout(() => {
      setActiveId(h.id); setFocus({ yaw: h.yaw, pitch: h.pitch }); setTourCaption(getStore(h.ref)?.name ?? null);
    }, 1000 + i * GLANCE_MS));
    timers.push(window.setTimeout(() => {
      setActiveId(null); setTourCaption(null);
      const next = tourIdx + 1;
      if (next >= TOUR_PATH.length) return setTourIdx(null);
      setTourIdx(next);
      navigate(TOUR_PATH[next]);
    }, 1400 + Math.max(1, stores.length) * GLANCE_MS));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [tourIdx, status, transition, sceneId, hotspots, navigate]);

  const startTour = () => {
    setPanel(null); setMapOpen(false); setGuideOpen(false); setActiveId(null);
    setTourIdx(0);
    if (sceneId !== TOUR_PATH[0]) navigate(TOUR_PATH[0]);
  };
  const stopTour = () => { setTourIdx(null); setTourCaption(null); setActiveId(null); };

  const toggleSound = () => {
    if (soundOn) { ambientStop(); return setSoundOn(false); }
    if (!ambientStart()) return flash(t("xp.gyroDenied"));
    setSoundOn(true);
  };
  useEffect(() => () => ambientStop(), []);

  // viewer status: fade the transition out once the new panorama is ready (or immediately on failure)
  const onStatus = useCallback((st: PanoStatus) => {
    setStatus(st);
    if (st === "ready" && transitioning.current) window.setTimeout(() => { transitioning.current = false; setTransition(null); }, 350);
    if (st === "error") { transitioning.current = false; setTransition(null); }
  }, []);

  // after arrival: highlight + focus the requested hotspot, then open its panel
  useEffect(() => {
    if (!pendingPanel || status !== "ready" || transition) return;
    const hs = hotspots.find((h) => h.id === pendingPanel.hotspot);
    const id = window.setTimeout(() => {
      if (hs) { setActiveId(hs.id); setFocus({ yaw: hs.yaw, pitch: hs.pitch }); }
      window.setTimeout(() => setPanel(pendingPanel.panel), hs ? 800 : 0);
      setPendingPanel(null);
    }, 100);
    return () => window.clearTimeout(id);
  }, [pendingPanel, status, transition, hotspots]);

  // search overlay -> viewer
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent<{ scene: string; store?: string; product?: string }>).detail;
      if (d.product) goTo(d.scene, { panel: { kind: "product", id: d.product }, focusHotspot: `product:${d.product}` });
      else if (d.store) goTo(d.scene, { panel: { kind: "store", id: d.store }, focusHotspot: `store:${d.store}` });
      else goTo(d.scene);
    };
    window.addEventListener("vistra:nav", h);
    return () => window.removeEventListener("vistra:nav", h);
  }, [goTo]);

  const onSelect = useCallback((h: Hotspot) => {
    if (h.kind === "navigation") return goTo(h.ref);
    stopTour();
    setActiveId(h.id);
    setFocus({ yaw: h.yaw, pitch: h.pitch });
    setPanel({ kind: h.kind === "store" ? "store" : h.kind === "product" ? "product" : "info", id: h.kind === "info" ? h.ref : h.ref });
    setMapOpen(false);
  }, [goTo]);

  const closePanel = () => { setPanel(null); setActiveId(null); };

  const onViewClick = (y: number, p: number) => {
    if (!placing) return;
    setDrafts((ds) => ds.map((d) => (d.id === placing ? { ...d, yaw: +y.toFixed(2), pitch: +p.toFixed(2) } : d)));
    setPlacing(null);
  };

  // keyboard
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (panel) closePanel(); else if (mapOpen) setMapOpen(false); else if (guideOpen) setGuideOpen(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  // ---- map interactions
  const selectedStore = mapStore ? getStore(mapStore) : null;
  const doRoute = (to: string) => setRoute(findRoute(sceneId, to));
  const mapPickStore = (id: string) => { setMapStore(id); const s = getStore(id)!; setMapFloor(s.floorId); doRoute(s.sceneId); };
  const takeMeThere = () => {
    if (!selectedStore) return;
    setMapOpen(false);
    goTo(selectedStore.sceneId, { panel: { kind: "store", id: selectedStore.id }, focusHotspot: `store:${selectedStore.id}` });
    setRoute([]);
  };

  const toggleGyro = async () => {
    const r = await handle.current?.toggleGyro();
    if (r === "unsupported" || !r) return flash(t("xp.gyroDenied"));
    setGyroOn(r === "on");
  };

  const floorScenes = getScenesByFloor(scene.floorId);
  const iconBtn = "icon-btn xp-ui shrink-0 max-md:!size-10";

  return (
    <div ref={root} className="fixed inset-0 overflow-hidden bg-black text-fg"
      onPointerDownCapture={(e) => { if (tourIdx !== null && !(e.target as HTMLElement).closest("[data-keep-tour]")) stopTour(); }}>
      <PanoViewer ref={handle} scene={scene} arrivalYaw={yaw} hotspots={hotspots} activeId={activeId} locale={locale} focus={focus} retryKey={retryKey}
        onSelect={onSelect} onStatus={onStatus} onProgress={setProgress} onViewClick={onViewClick} />

      <GoldDust className="z-[2] opacity-50" />
      {/* readability gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/75 to-transparent" />

      {/* TOP BAR */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-5">
        <div className="xp-ui flex min-w-0 flex-col gap-1.5 text-white">
          <div className="flex items-center gap-3 text-white"><Logo size={18} /></div>
          <p className="mono-label !text-white/80" aria-live="polite">
            {floorName(scene.floorId)} <span className="text-champagne">/</span> <span className="!text-white">{L(scene.title)}</span>
          </p>
        </div>
        <button className="xp-ui hidden h-11 w-[min(380px,34vw)] items-center gap-3 border border-white/20 bg-black/40 px-4 text-sm text-white/70 backdrop-blur-md md:flex" onClick={() => setSearchOpen(true)} aria-label={t("a11y.search")}>
          <IconSearch width={18} /> <span className="truncate">{t("search.placeholder")}</span> <kbd className="mono-label ms-auto !text-white/50">/</kbd>
        </button>
        <div className="flex shrink-0 gap-1.5 md:gap-2">
          <button className={`${iconBtn} md:hidden`} onClick={() => setSearchOpen(true)} aria-label={t("a11y.search")}><IconSearch /></button>
          <button className={`${iconBtn} !w-auto px-3 font-mono text-xs`} onClick={() => setLocale(locale === "en" ? "ar" : "en")} aria-label={t("xp.lang")}>{t("lang.switch")}</button>
          <button className={`${iconBtn} hidden sm:grid`} onClick={toggleTheme} aria-label={t("a11y.theme")}>{theme === "dark" ? <IconSun /> : <IconMoon />}</button>
          <button className={`${iconBtn} hidden sm:grid`} onClick={() => handle.current?.toggleFullscreen()} aria-label={t("xp.fullscreen")}><IconFullscreen /></button>
          <Link href="/" className={`${iconBtn} !w-auto gap-2 px-3 font-mono text-xs`} aria-label={t("xp.exit")}><IconClose width={16} /><span className="hidden sm:inline">{t("xp.exit")}</span></Link>
        </div>
      </div>

      {/* LOADING / ERROR */}
      {status === "loading" && !transition && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 mx-auto w-56 text-center" role="status">
          <p className="mono-label !text-white">{t("xp.loading")} · {Math.round(progress)}%</p>
          <div className="mt-2 h-px bg-white/20"><div className="h-px bg-champagne transition-[width]" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/80 p-6 text-center" role="alert">
          <div className="space-y-4">
            <p className="text-white">{t("xp.error")}</p>
            <button className="btn btn-solid" onClick={() => setRetryKey((k) => k + 1)}>{t("xp.retry")}</button>
          </div>
        </div>
      )}

      {/* SCENE TRANSITION */}
      <div aria-hidden={!transition} className={`pointer-events-none absolute inset-0 z-[25] grid place-items-center bg-[#05060a] transition-opacity duration-300 ${transition ? "opacity-100" : "opacity-0"}`}>
        {transition?.thumb && <img src={transition.thumb} alt="" className="vx-warp absolute inset-0 h-full w-full object-cover opacity-30 blur-md" />}
        {transition && <span aria-hidden className="vx-scan absolute inset-x-0 h-px bg-cyan/80 shadow-[0_0_24px_4px_rgba(123,231,245,0.6)]" />}
        {transition && (
          <div className="relative text-center text-white">
            <IconArrow width={28} className="mx-auto mb-4 -rotate-90 text-cyan" />
            <p className="mono-label !text-cyan">{t("xp.arriving")}</p>
            <p className="display-m mt-2">{transition.title}</p>
            <p className="mono-label mt-2">{transition.floor}</p>
          </div>
        )}
      </div>

      {/* MINI MAP */}
      {miniOpen && !mapOpen && (
        <div className="xp-ui absolute bottom-[10.75rem] start-5 z-10 hidden w-56 border border-white/20 bg-black/55 p-2 backdrop-blur-md md:block">
          <button className="block w-full" onClick={() => { setMapFloor(scene.floorId); setMapOpen(true); }} aria-label={t("xp.map")}>
            <FloorMap floorId={scene.floorId} currentSceneId={sceneId} compact onScene={goTo} />
          </button>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:gap-3 md:p-5">
        <div className="xp-ui scrollbar-none flex gap-2 overflow-x-auto" role="list" aria-label={t("xp.scenes")}>
          {floorScenes.map((s) => (
            <button key={s.id} role="listitem" onClick={() => goTo(s.id)} aria-current={s.id === sceneId}
              className={`group relative h-14 w-24 shrink-0 overflow-hidden border md:h-16 md:w-28 ${s.id === sceneId ? "border-champagne" : "border-white/25"}`}>
              <img src={s.thumbnail} alt="" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" loading="lazy" />
              <span className="mono-label absolute inset-x-0 bottom-0 truncate bg-black/65 px-1.5 py-0.5 !text-[9px] !text-white">{L(s.title)}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="xp-ui flex shrink-0 gap-1" role="group" aria-label={t("xp.floors")}>
            {floors.map((f) => (
              <button key={f.id} onClick={() => f.id !== scene.floorId && goTo(FLOOR_ENTRY[f.id])} aria-pressed={f.id === scene.floorId}
                className={`icon-btn !w-auto shrink-0 px-3 font-mono text-xs max-md:min-w-10 ${f.id === scene.floorId ? "!border-champagne !text-champagne" : ""}`} title={L(f.name)} aria-label={L(f.name)}>
                {f.level === 0 ? "G" : f.level}<span className="ms-2 hidden sm:inline">{floorName(f.id)}</span>
              </button>
            ))}
          </div>
          <div className="scrollbar-none flex min-w-0 gap-1 overflow-x-auto md:gap-1.5">
            <button className={`${iconBtn} hidden md:grid`} aria-pressed={miniOpen} onClick={() => setMiniOpen((m) => !m)} aria-label={t("xp.map")} title="Mini-map"><IconCompass /></button>
            <button className={iconBtn} aria-pressed={mapOpen} onClick={() => { setMapFloor(scene.floorId); setMapOpen((m) => !m); setPanel(null); }} aria-label={t("xp.map")}><IconMap /></button>
            <button className={iconBtn} aria-pressed={tourIdx !== null} data-keep-tour onClick={() => (tourIdx === null ? startTour() : stopTour())} aria-label={t("xp.tour")} title={t("xp.tour")}><IconPlay /></button>
            <button className={iconBtn} aria-pressed={soundOn} data-keep-tour onClick={toggleSound} aria-label={t("xp.sound")} title={t("xp.sound")}><IconSound /></button>
            <button className={iconBtn} aria-pressed={guideOpen} onClick={() => setGuideOpen((g) => !g)} aria-label={t("xp.guide")}><IconInfo /></button>
            <button className={`${iconBtn} md:hidden`} aria-pressed={gyroOn} onClick={toggleGyro} aria-label={t("xp.gyro")}><IconGyro /></button>
            <button className={`${iconBtn} hidden md:grid`} onClick={() => handle.current?.zoomOut()} aria-label={t("xp.zoomOut")}><IconMinus /></button>
            <button className={`${iconBtn} hidden md:grid`} onClick={() => handle.current?.zoomIn()} aria-label={t("xp.zoomIn")}><IconPlus /></button>
          </div>
        </div>
      </div>

      {/* TOUR HUD */}
      {tourIdx !== null && (
        <div data-keep-tour role="status" className="absolute inset-x-0 top-20 z-20 mx-auto flex w-[min(460px,92vw)] items-center gap-4 border border-champagne/60 bg-black/60 px-4 py-3 text-white backdrop-blur-md md:top-24">
          <div className="min-w-0 grow">
            <p className="mono-label !text-champagne">{t("xp.tour")} · {t("xp.tourStep")} {tourIdx + 1}/{TOUR_PATH.length}</p>
            <p className="truncate text-lg">{tourCaption ?? L(scene.title)}</p>
            <div className="mt-2 h-px bg-white/20"><div className="h-px bg-champagne transition-[width] duration-700" style={{ width: `${((tourIdx + 1) / TOUR_PATH.length) * 100}%` }} /></div>
          </div>
          <button className="btn !min-h-9 !px-3" onClick={stopTour}>{t("xp.tourStop")}</button>
        </div>
      )}

      {toast && <div role="status" className="mono-label absolute bottom-40 left-1/2 z-30 -translate-x-1/2 border border-line bg-bg px-4 py-2 text-fg">{toast}</div>}

      {/* GUIDE */}
      {guideOpen && (
        <div className="absolute bottom-40 end-3 z-30 w-[min(340px,92vw)] border border-line bg-bg/95 p-5 backdrop-blur-xl md:end-5" role="dialog" aria-label={t("xp.guideTitle")}>
          <h2 className="mono-label mb-3 text-champagne">{t("xp.guideTitle")}</h2>
          <ul className="space-y-2 text-sm text-fg2">{(["xp.guide1", "xp.guide2", "xp.guide3", "xp.guide4"] as const).map((k) => <li key={k}>— {t(k)}</li>)}</ul>
        </div>
      )}

      {/* PANELS */}
      <SidePanel open={panel?.kind === "store"} onClose={closePanel} label={t("xp.panelStore")}>
        {panel?.kind === "store" && <StorePanel storeId={panel.id} onShowOnMap={() => { closePanel(); mapPickStore(panel.id); setMapOpen(true); }} />}
      </SidePanel>
      <SidePanel open={panel?.kind === "product"} onClose={closePanel} label={t("xp.panelProduct")} wide>
        {panel?.kind === "product" && <ProductPanel productId={panel.id} />}
      </SidePanel>
      <SidePanel open={panel?.kind === "info"} onClose={closePanel} label={t("xp.info")}>
        {panel?.kind === "info" && <InfoPanel sceneId={sceneId} infoId={panel.id} />}
      </SidePanel>

      {/* FLOOR MAP PANEL */}
      <SidePanel open={mapOpen} onClose={() => setMapOpen(false)} label={t("xp.map")} wide>
        <div className="space-y-4 p-5 pt-16">
          <h2 className="mono-label text-champagne">{t("xp.map")}</h2>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("xp.floors")}>
            {floors.map((f) => (
              <button key={f.id} role="tab" aria-selected={mapFloor === f.id} onClick={() => setMapFloor(f.id)} className={`btn !min-h-9 !px-3 ${mapFloor === f.id ? "btn-solid" : ""}`}>{floorName(f.id)}</button>
            ))}
          </div>
          <input className="field" value={mapQuery} onChange={(e) => setMapQuery(e.target.value.slice(0, 40))} placeholder={t("dir.search")} aria-label={t("dir.search")} />
          <div className="flex flex-wrap gap-1.5">
            <button className={`mono-label border px-2 py-1 ${!mapCat ? "border-champagne !text-champagne" : "border-line"}`} onClick={() => setMapCat(null)}>{t("cat.all")}</button>
            {getCategories().map((c) => <button key={c} onClick={() => setMapCat(mapCat === c ? null : c)} className={`mono-label border px-2 py-1 ${mapCat === c ? "border-champagne !text-champagne" : "border-line"}`}>{cat(c)}</button>)}
          </div>
          <FloorMap floorId={mapFloor} currentSceneId={sceneId} route={route} selectedStoreId={mapStore} category={mapCat} query={mapQuery}
            onScene={(id) => { setMapOpen(false); goTo(id); setRoute([]); }} onStore={mapPickStore} />
          {selectedStore ? (
            <div className="space-y-3 border border-line p-4">
              <div className="flex items-baseline justify-between gap-3"><h3 className="text-xl">{selectedStore.name}</h3><span className="mono-label">{cat(selectedStore.category)}</span></div>
              <p className="text-sm text-fg2">{L(selectedStore.description)}</p>
              <p className="mono-label">{floorName(selectedStore.floorId)} · {L(getScene(selectedStore.sceneId)!.title)}{route.length > 1 && ` · ${t("xp.route")}: ${route.length - 1} ${t("xp.stepsAway")}`}</p>
              <div className="flex gap-2"><button className="btn btn-solid grow" onClick={takeMeThere}>{t("xp.goTo")}</button><Link className="btn grow" href={`/stores/${selectedStore.slug}`}>{t("xp.viewStore")}</Link></div>
            </div>
          ) : (
            <ul className="grid gap-1 text-sm" aria-label={t("nav.stores")}>
              {getStores().filter((s) => s.floorId === mapFloor && (!mapCat || s.category === mapCat) && (!mapQuery || s.name.toLowerCase().includes(mapQuery.toLowerCase()))).map((s) => (
                <li key={s.id}><button className="flex w-full items-center justify-between border-b border-line py-2 text-start hover:text-champagne" onClick={() => mapPickStore(s.id)}><span>{s.name}</span><span className="mono-label">{cat(s.category)}</span></button></li>
              ))}
            </ul>
          )}
        </div>
      </SidePanel>

      {debug && <HotspotEditor sceneId={sceneId} drafts={drafts} setDrafts={setDrafts} placing={placing} setPlacing={setPlacing} getView={() => handle.current?.getPosition() ?? { yaw: 0, pitch: 0 }} />}
      <span className="sr-only" aria-live="polite">{L(scene.title)}</span>
    </div>
  );
}
