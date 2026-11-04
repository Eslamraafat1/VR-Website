/**
 * Base URL for metadata, sitemap.xml and robots.txt.
 *
 * The project has no public deployment, so this resolves to:
 * NEXT_PUBLIC_SITE_URL -> the Vercel production domain (if deployed there)
 * -> http://localhost:3000 for local runs.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "VISTRA®";
export const SITE_DESCRIPTION =
  "The world of shopping, reimagined. Explore a virtual mall in 360°, discover stores, products and offers.";

const DEFAULT_OG_IMAGE = { url: "/images/mall/hero.jpg", width: 1920, height: 1080, alt: "VISTRA virtual mall" };

/**
 * Builds page metadata. Next.js replaces (does not merge) a parent's
 * `openGraph` object when a page sets its own, so every page goes through
 * this helper to keep site name, type and a fallback image.
 */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
      url: path,
      images: image ? [{ url: image, alt: title }] : [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image" as const },
  };
}
