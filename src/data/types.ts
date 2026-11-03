export type Locale = "en" | "ar";
export type L = { en: string; ar: string };

export type CategoryId =
  | "fashion"
  | "electronics"
  | "beauty"
  | "jewelry"
  | "home"
  | "dining"
  | "sports"
  | "entertainment";

export interface Mall {
  id: string;
  name: string;
  description: L;
  floors: string[];
  heroImage: string;
  coordinates: { lat: string; lng: string };
}

export interface Floor {
  id: string;
  name: L;
  level: number;
  scenes: string[];
}

export interface Pt {
  x: number;
  y: number;
}
export interface Rect extends Pt {
  w: number;
  h: number;
}

export type HotspotKind = "navigation" | "store" | "product" | "info";

export interface SceneLink {
  to: string;
  /** anchor key from generated/anchors.json */
  anchor: string;
}

export interface InfoSpot {
  id: string;
  anchor: string;
  title: L;
  text: L;
}

export interface Scene {
  id: string;
  title: L;
  floorId: string;
  panorama: string;
  thumbnail: string;
  initialYaw: number;
  initialPitch: number;
  connectedScenes: SceneLink[];
  info: InfoSpot[];
  map: Pt;
}

/** A resolved, positioned hotspot (degrees) ready for the viewer. */
export interface Hotspot {
  id: string;
  kind: HotspotKind;
  sceneId: string;
  yaw: number;
  pitch: number;
  title: L;
  /** navigation: destination scene · store: storeId · product: productId · info: infoSpot id */
  ref: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  monogram: string;
  tagline: L;
  category: CategoryId;
  floorId: string;
  sceneId: string;
  bay: string;
  description: L;
  hours: L;
  contact: { phone: string; email: string; website: string };
  socialLinks: { instagram: string; x: string };
  coverImage: string;
  featured: boolean;
  map: Rect;
  color: string;
}

export interface Variant {
  name: L;
  swatch: string;
}

export interface Product {
  id: string;
  slug: string;
  name: L;
  storeId: string;
  category: CategoryId;
  images: string[];
  price: number;
  discountPrice?: number;
  description: L;
  variants: Variant[];
  hotspotId: string;
  sceneId: string;
  newArrival?: boolean;
}

export interface Offer {
  id: string;
  title: L;
  description: L;
  storeId: string;
  productId?: string;
  discount: number;
  startDate: string;
  endDate: string;
  image: string;
  campaign?: boolean;
}

export interface Experience {
  id: string;
  title: L;
  tagline: L;
  image: string;
  sceneId: string;
  tone: string;
}
