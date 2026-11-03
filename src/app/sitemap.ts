import type { MetadataRoute } from "next";
import { getProducts, getStores } from "@/data/service";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ["", "/experience", "/stores", "/products", "/offers", "/about", "/contact", "/privacy", "/terms"];
  return [
    ...fixed.map((p) => ({ url: `${SITE}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : p === "/experience" ? 0.9 : 0.6 })),
    ...getStores().map((s) => ({ url: `${SITE}/stores/${s.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...getProducts().map((p) => ({ url: `${SITE}/products/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
