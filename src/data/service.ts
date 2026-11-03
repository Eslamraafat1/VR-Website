// Centralised data service. Every UI reads through these functions so the mock
// data can later be swapped for a real API (make them async / fetch-based).
import anchorsJson from "./generated/anchors.json";
import { CATEGORIES, EXPERIENCES, FLOORS, MALL, OFFERS, PRODUCTS, SCENES, STORES } from "./mall";
import type { CategoryId, Floor, Hotspot, Locale, Offer, Product, Scene, Store } from "./types";

type Anchor = { yaw: number; pitch: number };
const ANCHORS = anchorsJson as Record<string, Record<string, Anchor>>;

export const getMall = () => MALL;
export const getFloors = (): Floor[] => FLOORS;
export const getFloor = (id: string) => FLOORS.find((f) => f.id === id);
export const getScenes = (): Scene[] => SCENES;
export const getScene = (id: string) => SCENES.find((s) => s.id === id);
export const getScenesByFloor = (floorId: string) => SCENES.filter((s) => s.floorId === floorId);
export const getStores = (): Store[] => STORES;
export const getStore = (idOrSlug: string) => STORES.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
export const getProducts = (): Product[] => PRODUCTS;
export const getProduct = (idOrSlug: string) => PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
export const getProductsByStore = (storeId: string) => PRODUCTS.filter((p) => p.storeId === storeId);
export const getOffers = (): Offer[] => OFFERS;
export const getOffersByStore = (storeId: string) => OFFERS.filter((o) => o.storeId === storeId);
export const getCategories = () => CATEGORIES;
export const getExperiences = () => EXPERIENCES;
export const getStoresByScene = (sceneId: string) => STORES.filter((s) => s.sceneId === sceneId);
export const getFeaturedStores = () => STORES.filter((s) => s.featured);

export const anchorOf = (sceneId: string, key: string): Anchor | undefined => ANCHORS[sceneId]?.[key];

export const effectivePrice = (p: Product) => p.discountPrice ?? p.price;
export const discountPct = (p: Product) => (p.discountPrice ? Math.round((1 - p.discountPrice / p.price) * 100) : 0);

/** All hotspots for a scene, derived from the graph, stores and products. */
export function getHotspots(sceneId: string): Hotspot[] {
  const scene = getScene(sceneId);
  if (!scene) return [];
  const out: Hotspot[] = [];
  for (const link of scene.connectedScenes) {
    const a = anchorOf(sceneId, link.anchor);
    const dest = getScene(link.to);
    if (a && dest) out.push({ id: `nav:${sceneId}>${link.to}`, kind: "navigation", sceneId, yaw: a.yaw, pitch: Math.min(a.pitch, -4), title: dest.title, ref: link.to });
  }
  for (const st of getStoresByScene(sceneId)) {
    const a = anchorOf(sceneId, `${st.bay}@sign`);
    if (a) out.push({ id: `store:${st.id}`, kind: "store", sceneId, yaw: a.yaw, pitch: a.pitch, title: { en: st.name, ar: st.name }, ref: st.id });
  }
  for (const p of PRODUCTS.filter((p) => p.sceneId === sceneId)) {
    const a = anchorOf(sceneId, p.hotspotId);
    if (a) out.push({ id: `product:${p.id}`, kind: "product", sceneId, yaw: a.yaw, pitch: a.pitch - 3, title: p.name, ref: p.id });
  }
  for (const i of scene.info) {
    const a = anchorOf(sceneId, i.anchor);
    if (a) out.push({ id: `info:${i.id}`, kind: "info", sceneId, yaw: a.yaw, pitch: a.pitch, title: i.title, ref: i.id });
  }
  return out;
}

/** Yaw to face when arriving in `to` coming from `from` (looks away from the door we came through). */
export function arrivalYaw(from: string, to: string): number {
  const back = getScene(to)?.connectedScenes.find((l) => l.to === from);
  const a = back && anchorOf(to, back.anchor);
  if (!a) return getScene(to)?.initialYaw ?? 0;
  return ((a.yaw + 180 + 540) % 360) - 180;
}

/** Shortest path between scenes through the connection graph (BFS). */
export function findRoute(from: string, to: string): string[] {
  if (from === to) return [from];
  const prev = new Map<string, string>([[from, ""]]);
  const q = [from];
  while (q.length) {
    const cur = q.shift()!;
    for (const l of getScene(cur)?.connectedScenes ?? []) {
      if (prev.has(l.to)) continue;
      prev.set(l.to, cur);
      if (l.to === to) {
        const path = [to];
        let n = cur;
        while (n) { path.unshift(n); n = prev.get(n)!; }
        return path;
      }
      q.push(l.to);
    }
  }
  return [];
}

export const pick = (v: { en: string; ar: string }, locale: Locale) => v[locale];

// ---------- search
export type SearchHit = { scene?: string; store?: string; product?: string } & (
  | { type: "store"; id: string; title: string; sub: string; href: string; image: string }
  | { type: "product"; id: string; title: string; sub: string; href: string; image: string }
  | { type: "category"; id: string; title: string; sub: string; href: string; image?: string }
  | { type: "location"; id: string; title: string; sub: string; href: string; image: string }
  | { type: "offer"; id: string; title: string; sub: string; href: string; image: string });

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function search(query: string, locale: Locale, labels: { category: (c: CategoryId) => string; floor: (id: string) => string }): SearchHit[] {
  const q = norm(query);
  if (!q) return [];
  const hit = (...vals: string[]) => vals.some((v) => norm(v).includes(q));
  const out: SearchHit[] = [];
  for (const c of CATEGORIES) if (hit(c, labels.category(c))) out.push({ type: "category", id: c, title: labels.category(c), sub: "", href: `/stores?category=${c}` });
  for (const s of STORES) if (hit(s.name, s.tagline.en, s.tagline.ar, s.category, labels.category(s.category))) out.push({ type: "store", id: s.id, title: s.name, sub: `${labels.category(s.category)} · ${labels.floor(s.floorId)}`, href: `/stores/${s.slug}`, image: s.coverImage, scene: s.sceneId, store: s.id });
  for (const p of PRODUCTS) if (hit(p.name.en, p.name.ar, p.category, labels.category(p.category), getStore(p.storeId)!.name)) out.push({ type: "product", id: p.id, title: p.name[locale], sub: getStore(p.storeId)!.name, href: `/products/${p.slug}`, image: p.images[0], scene: p.sceneId, product: p.id });
  for (const sc of SCENES) if (hit(sc.title.en, sc.title.ar)) out.push({ type: "location", id: sc.id, title: sc.title[locale], sub: labels.floor(sc.floorId), href: `/experience?scene=${sc.id}`, image: sc.thumbnail, scene: sc.id });
  for (const o of OFFERS) if (hit(o.title.en, o.title.ar)) out.push({ type: "offer", id: o.id, title: o.title[locale], sub: `−${o.discount}%`, href: `/offers#${o.id}`, image: o.image });
  return out;
}
