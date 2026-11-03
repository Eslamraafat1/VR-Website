"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import type { Hotspot, Locale, Scene } from "@/data/types";
import { getScene } from "@/data/service";

export interface PanoHandle {
  zoomIn(): void;
  zoomOut(): void;
  toggleFullscreen(): void;
  toggleGyro(): Promise<"on" | "off" | "unsupported">;
  getPosition(): { yaw: number; pitch: number };
  lookAt(yaw: number, pitch: number): void;
}

export type PanoStatus = "loading" | "ready" | "error";

interface Props {
  scene: Scene;
  /** yaw (deg) to face on arrival */
  arrivalYaw: number;
  hotspots: Hotspot[];
  activeId: string | null;
  locale: Locale;
  focus?: { yaw: number; pitch: number } | null;
  retryKey: number;
  onSelect: (h: Hotspot) => void;
  onStatus: (s: PanoStatus) => void;
  onProgress: (p: number) => void;
  onViewClick?: (yaw: number, pitch: number) => void;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11l6-6 6 6"/></svg>`;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

function buildEl(h: Hotspot, locale: Locale, active: boolean, onSelect: (h: Hotspot) => void): HTMLElement {
  const el = document.createElement("div");
  el.className = `vx-hotspot${active ? " vx-active" : ""}`;
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  const title = h.title[locale];
  el.setAttribute("aria-label", title);
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(h); } });

  const tip = (name: string, sub: string, img?: string) => {
    const t = document.createElement("div");
    t.className = "vx-tip";
    if (img) { const i = document.createElement("img"); i.src = img; i.alt = ""; i.loading = "lazy"; t.appendChild(i); }
    const b = document.createElement("b"); b.textContent = name; t.appendChild(b);
    const s = document.createElement("span"); s.textContent = sub; t.appendChild(s);
    return t;
  };

  if (h.kind === "navigation") {
    const dest = getScene(h.ref);
    const n = document.createElement("div"); n.className = "vx-nav"; n.innerHTML = ARROW; // static, trusted markup
    el.appendChild(n);
    el.appendChild(tip(title, dest ? (locale === "ar" ? (dest.floorId === "ground" ? "الطابق الأرضي" : "الطابق الأول") : dest.floorId === "ground" ? "Ground floor" : "First floor") : "", dest?.thumbnail));
  } else if (h.kind === "store") {
    const s = document.createElement("div"); s.className = "vx-store";
    s.appendChild(document.createElement("i"));
    const span = document.createElement("span"); span.textContent = title; s.appendChild(span);
    el.appendChild(s);
  } else if (h.kind === "product") {
    const p = document.createElement("div"); p.className = "vx-product"; el.appendChild(p);
    el.appendChild(tip(title, locale === "ar" ? "منتج" : "Product"));
  } else {
    const i = document.createElement("div"); i.className = "vx-info"; i.textContent = "i"; el.appendChild(i);
    el.appendChild(tip(title, locale === "ar" ? "معلومة" : "Info"));
  }
  return el;
}

const PanoViewer = forwardRef<PanoHandle, Props>(function PanoViewer(props, ref) {
  const host = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersRef = useRef<MarkersPlugin | null>(null);
  const loadedScene = useRef<string | null>(null);
  const hotspotMap = useRef<Map<string, Hotspot>>(new Map());
  const cb = useRef(props);
  cb.current = props;
  const [webgl, setWebgl] = useState(true);

  useImperativeHandle(ref, () => ({
    zoomIn: () => viewerRef.current?.zoomIn(),
    zoomOut: () => viewerRef.current?.zoomOut(),
    toggleFullscreen: () => viewerRef.current?.toggleFullscreen(),
    toggleGyro: async () => {
      const g = viewerRef.current?.getPlugin<GyroscopePlugin>(GyroscopePlugin);
      if (!g || !(await g.isSupported())) return "unsupported";
      if (g.isEnabled()) { g.stop(); return "off"; }
      try { await g.start("smooth"); return "on"; } catch { return "unsupported"; }
    },
    getPosition: () => { const p = viewerRef.current?.getPosition(); return { yaw: p ? deg(p.yaw) : 0, pitch: p ? deg(p.pitch) : 0 }; },
    lookAt: (yaw, pitch) => { viewerRef.current?.animate({ yaw: rad(yaw), pitch: rad(pitch), speed: "30rpm" }); },
  }));

  const renderMarkers = useCallback(() => {
    const mp = markersRef.current;
    if (!mp) return;
    const { hotspots, locale, activeId, scene } = cb.current;
    mp.clearMarkers();
    hotspotMap.current = new Map();
    for (const h of hotspots) {
      if (h.sceneId !== scene.id) continue;
      hotspotMap.current.set(h.id, h);
      mp.addMarker({
        id: h.id,
        position: { yaw: rad(h.yaw), pitch: rad(h.pitch) },
        element: buildEl(h, locale, h.id === activeId, (x) => cb.current.onSelect(x)),
        size: { width: h.kind === "store" ? 160 : 56, height: 56 },
        anchor: "center center",
        zIndex: h.id === activeId ? 10 : h.kind === "navigation" ? 4 : 2,
      });
    }
  }, []);

  // create the viewer once (and tear it down on unmount / route change)
  useEffect(() => {
    if (!host.current) return;
    if (!hasWebGL()) { setWebgl(false); cb.current.onStatus("ready"); return; }
    const { scene, arrivalYaw } = cb.current;
    let destroyed = false;
    cb.current.onStatus("loading");
    const viewer = new Viewer({
      container: host.current,
      panorama: scene.panorama,
      defaultYaw: rad(arrivalYaw),
      defaultPitch: rad(scene.initialPitch),
      navbar: false,
      mousewheelCtrlKey: false,
      moveInertia: true,
      minFov: 35,
      maxFov: 100,
      defaultZoomLvl: 25,
      loadingImg: undefined,
      plugins: [[MarkersPlugin, {}], [GyroscopePlugin, { absolutePosition: false }]],
    });
    viewerRef.current = viewer;
    loadedScene.current = scene.id;
    markersRef.current = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
    markersRef.current.addEventListener("select-marker", ({ marker }) => {
      const h = hotspotMap.current.get(marker.id);
      if (h) cb.current.onSelect(h);
    });
    viewer.addEventListener("load-progress", ({ progress }) => cb.current.onProgress(progress));
    viewer.addEventListener("panorama-loaded", () => { if (!destroyed) cb.current.onStatus("ready"); });
    viewer.addEventListener("panorama-error", () => { if (!destroyed) cb.current.onStatus("error"); });
    viewer.addEventListener("click", ({ data }) => { if (!data.rightclick) cb.current.onViewClick?.(deg(data.yaw), deg(data.pitch)); });
    viewer.addEventListener("ready", () => { if (!destroyed) renderMarkers(); }, { once: true });
    return () => {
      destroyed = true;
      markersRef.current = null;
      viewerRef.current = null;
      loadedScene.current = null;
      viewer.destroy();
    };
  }, [renderMarkers]);

  // scene changes (and retries) after initial mount
  const { scene, arrivalYaw, retryKey } = props;
  const lastRetry = useRef(retryKey);
  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    const retried = lastRetry.current !== retryKey;
    lastRetry.current = retryKey;
    if (loadedScene.current === scene.id && !retried) return;
    loadedScene.current = scene.id;
    cb.current.onStatus("loading");
    cb.current.onProgress(0);
    v.setPanorama(scene.panorama, { position: { yaw: rad(arrivalYaw), pitch: rad(scene.initialPitch) }, transition: false, showLoader: false, zoom: 25 })
      .then((ok) => { if (ok) { cb.current.onStatus("ready"); renderMarkers(); } })
      .catch(() => cb.current.onStatus("error"));
  }, [scene, arrivalYaw, retryKey, renderMarkers]);

  // refresh markers when hotspots / language / active marker change
  useEffect(() => { if (loadedScene.current === props.scene.id) renderMarkers(); }, [props.hotspots, props.locale, props.activeId, props.scene.id, renderMarkers]);

  // camera focus request (e.g. highlighted product)
  useEffect(() => {
    if (props.focus) viewerRef.current?.animate({ yaw: rad(props.focus.yaw), pitch: rad(props.focus.pitch), speed: "40rpm" });
  }, [props.focus]);

  // warm the cache with adjacent scenes once the current one is idle
  useEffect(() => {
    const t = window.setTimeout(() => {
      for (const l of props.scene.connectedScenes.slice(0, 3)) { const im = new Image(); im.decoding = "async"; im.src = getScene(l.to)?.panorama ?? ""; }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [props.scene]);

  if (!webgl) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-black">
        <img src={props.scene.thumbnail} alt={props.scene.title[props.locale]} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <p className="relative mono-label bg-bg/80 p-4 text-fg">WebGL is unavailable on this device — showing a static preview.</p>
      </div>
    );
  }
  return <div ref={host} className="absolute inset-0" />;
});

export default PanoViewer;
