import Link from "next/link";

/** VISTRA® wordmark. */
export default function Logo({ size = 22, href = "/" }: { size?: number; href?: string | null }) {
  const mark = (
    <span className="inline-flex items-center gap-2.5 text-fg" style={{ fontSize: size }} dir="ltr">
      <svg width={size * 1.1} height={size * 1.1} viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M2 4 16 28 30 4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 4 16 16 23 4" stroke="var(--champagne)" strokeWidth="1.6" />
      </svg>
      <span className="font-semibold tracking-[0.16em] sm:tracking-[0.32em]" style={{ fontFamily: "var(--font-sans-latin), sans-serif" }}>
        VISTRA<sup className="ms-0.5 text-[0.45em] align-super tracking-normal">®</sup>
      </span>
    </span>
  );
  return href ? <Link href={href} aria-label="VISTRA home">{mark}</Link> : mark;
}

/** Fictional store monogram "logo" (no real brand marks are used). */
/** Brand colours are designed for dark surfaces; blend with the foreground so they stay legible in both themes. */
export const tint = (c: string) => `color-mix(in srgb, ${c} 62%, var(--fg))`;

export function StoreLogo({ name, monogram, color, size = 44 }: { name: string; monogram: string; color: string; size?: number }) {
  return (
    <span role="img" aria-label={`${name} logo`} className="inline-grid shrink-0 place-items-center border font-semibold" dir="ltr"
      style={{ width: size, height: size, borderColor: tint(color), color: tint(color), fontSize: size * 0.36, letterSpacing: "0.08em", fontFamily: "var(--font-sans-latin), sans-serif" }}>
      {monogram}
    </span>
  );
}
