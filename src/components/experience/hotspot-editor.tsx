"use client";

import { useState } from "react";
import { getProducts, getScenes, getStores } from "@/data/service";
import type { Hotspot, HotspotKind } from "@/data/types";

/**
 * DEVELOPER-ONLY hotspot editor (enabled with /experience?debug=1).
 * Drafts are kept in memory and exported as JSON — no persistence is faked.
 */
export default function HotspotEditor({ sceneId, drafts, setDrafts, placing, setPlacing, getView }: {
  sceneId: string;
  drafts: Hotspot[];
  setDrafts: (d: Hotspot[]) => void;
  placing: string | null;
  setPlacing: (id: string | null) => void;
  getView: () => { yaw: number; pitch: number };
}) {
  const [copied, setCopied] = useState(false);
  const mine = drafts.filter((d) => d.sceneId === sceneId);
  const upd = (id: string, patch: Partial<Hotspot>) => setDrafts(drafts.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const add = () => {
    const v = getView();
    const id = `draft:${Date.now().toString(36)}`;
    setDrafts([...drafts, { id, kind: "info", sceneId, yaw: +v.yaw.toFixed(2), pitch: +v.pitch.toFixed(2), title: { en: "New hotspot", ar: "علامة جديدة" }, ref: "draft" }]);
  };
  const exportJson = async () => {
    const json = JSON.stringify({ sceneId, hotspots: mine.map((d) => ({ kind: d.kind, sceneId: d.sceneId, yaw: d.yaw, pitch: d.pitch, title: d.title, ref: d.ref })) }, null, 2);
    try { await navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { window.prompt("Copy JSON", json); }
  };
  const refOptions = (k: HotspotKind) =>
    k === "store" ? getStores().map((s) => [s.id, s.name]) : k === "product" ? getProducts().map((p) => [p.id, p.name.en]) : k === "navigation" ? getScenes().map((s) => [s.id, s.title.en]) : [];

  return (
    <div className="fixed bottom-24 start-3 z-40 max-h-[60vh] w-[min(360px,94vw)] overflow-auto border border-champagne bg-bg/95 p-4 text-xs backdrop-blur" role="region" aria-label="Hotspot editor">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="mono-label text-champagne">DEV · Hotspot editor — {sceneId}</h2>
      </div>
      <div className="mb-3 flex gap-2">
        <button className="btn !min-h-9 !px-3" onClick={add}>+ Add at view center</button>
        <button className="btn !min-h-9 !px-3" onClick={exportJson}>{copied ? "Copied" : "Copy JSON"}</button>
      </div>
      <p className="mb-3 text-fg3">Select a draft, tick “place”, then click the panorama to set its yaw/pitch. Positions are degrees (yaw 0 = image center).</p>
      <ul className="space-y-3">
        {mine.map((d) => (
          <li key={d.id} className="space-y-2 border border-line p-2">
            <div className="flex gap-2">
              <select className="field !py-1 !text-xs" value={d.kind} onChange={(e) => upd(d.id, { kind: e.target.value as HotspotKind, ref: "" })} aria-label="Type">
                {(["navigation", "store", "product", "info"] as const).map((k) => <option key={k}>{k}</option>)}
              </select>
              <button className="btn !min-h-8 !px-2" onClick={() => setDrafts(drafts.filter((x) => x.id !== d.id))} aria-label="Delete">✕</button>
            </div>
            <input className="field !py-1 !text-xs" value={d.title.en} onChange={(e) => upd(d.id, { title: { ...d.title, en: e.target.value } })} aria-label="Title (EN)" placeholder="Title EN" />
            <input className="field !py-1 !text-xs" dir="rtl" value={d.title.ar} onChange={(e) => upd(d.id, { title: { ...d.title, ar: e.target.value } })} aria-label="Title (AR)" placeholder="العنوان" />
            {d.kind !== "info" && (
              <select className="field !py-1 !text-xs" value={d.ref} onChange={(e) => upd(d.id, { ref: e.target.value })} aria-label="Reference">
                <option value="">— link to —</option>
                {refOptions(d.kind).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
              </select>
            )}
            <div className="grid grid-cols-2 gap-2">
              <label>Yaw<input type="number" step="0.5" className="field !py-1 !text-xs" value={d.yaw} onChange={(e) => upd(d.id, { yaw: +e.target.value })} /></label>
              <label>Pitch<input type="number" step="0.5" className="field !py-1 !text-xs" value={d.pitch} onChange={(e) => upd(d.id, { pitch: +e.target.value })} /></label>
            </div>
            <div className="flex gap-2">
              <button className="btn !min-h-8 !px-2" onClick={() => { const v = getView(); upd(d.id, { yaw: +v.yaw.toFixed(2), pitch: +v.pitch.toFixed(2) }); }}>Set from view</button>
              <label className="flex items-center gap-1"><input type="checkbox" checked={placing === d.id} onChange={(e) => setPlacing(e.target.checked ? d.id : null)} /> place by click</label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
