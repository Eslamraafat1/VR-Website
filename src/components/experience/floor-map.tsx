"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useApp } from "@/components/providers";
import { getScene, getScenesByFloor, getStores } from "@/data/service";
import type { CategoryId } from "@/data/types";

interface Props {
  floorId: string;
  currentSceneId: string;
  route?: string[];
  selectedStoreId?: string | null;
  category?: CategoryId | null;
  query?: string;
  compact?: boolean;
  onScene: (sceneId: string) => void;
  onStore?: (storeId: string) => void;
}

/** Architectural SVG floor plan generated from the shared scene graph + store data. */
export default function FloorMap({ floorId, currentSceneId, route = [], selectedStoreId, category, query = "", compact, onScene, onStore }: Props) {
  const { L, locale, t } = useApp();
  const gRef = useRef<SVGGElement>(null);
  const scenes = useMemo(() => getScenesByFloor(floorId), [floorId]);
  const stores = useMemo(() => getStores().filter((s) => s.floorId === floorId), [floorId]);
  const q = query.trim().toLowerCase();

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const out: [string, string][] = [];
    for (const s of scenes) for (const l of s.connectedScenes) {
      const d = getScene(l.to);
      if (!d || d.floorId !== floorId) continue;
      const k = [s.id, d.id].sort().join("|");
      if (!seen.has(k)) { seen.add(k); out.push([s.id, d.id]); }
    }
    return out;
  }, [scenes, floorId]);

  const routePts = useMemo(() => route.map((id) => getScene(id)).filter((s) => s && s.floorId === floorId).map((s) => `${s!.map.x},${s!.map.y}`).join(" "), [route, floorId]);
  const liftScenes = useMemo(() => new Set(scenes.filter((s) => s.connectedScenes.some((l) => getScene(l.to)?.floorId !== floorId)).map((s) => s.id)), [scenes, floorId]);

  // floor-change animation
  useEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(g, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
      gsap.from(g.querySelectorAll("[data-pop]"), { scale: 0, transformOrigin: "50% 50%", duration: 0.45, stagger: 0.04, delay: 0.2, ease: "back.out(2)" });
    }, g);
    return () => ctx.revert();
  }, [floorId]);

  const current = getScene(currentSceneId);

  return (
    <svg viewBox="0 0 1000 600" role="img" aria-label={t("xp.map")} className="h-auto w-full select-none">
      <defs>
        <pattern id="plan-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--line)" strokeWidth="1" />
        </pattern>
      </defs>
      <g ref={gRef}>
        {/* shell */}
        <path d="M30 60 L60 30 H940 L970 60 V540 L940 570 H60 L30 540Z" fill="url(#plan-hatch)" stroke="var(--fg-3)" strokeWidth="2" opacity="0.9" />
        <path d="M44 66 L66 44 H934 L956 66 V534 L934 556 H66 L44 534Z" fill="var(--bg)" stroke="var(--line)" strokeWidth="1" />
        {/* corridors */}
        {edges.map(([a, b]) => {
          const A = getScene(a)!.map, B = getScene(b)!.map;
          return <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--surface-2)" strokeWidth="38" strokeLinecap="round" />;
        })}
        {scenes.some((s) => s.id === "atrium") && <circle cx="500" cy="340" r="78" fill="var(--surface-2)" stroke="var(--fg-3)" strokeDasharray="3 5" />}
        {/* stores */}
        {stores.map((s) => {
          const match = (!category || s.category === category) && (!q || s.name.toLowerCase().includes(q));
          const sel = selectedStoreId === s.id;
          const node = getScene(s.sceneId)!.map;
          const cx = s.map.x + s.map.w / 2, cy = s.map.y + s.map.h / 2;
          return (
            <g key={s.id} data-pop opacity={match ? 1 : 0.22} style={{ cursor: onStore ? "pointer" : "default" }}
              role={onStore ? "button" : undefined} tabIndex={onStore ? 0 : undefined} aria-label={s.name}
              onClick={() => onStore?.(s.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onStore?.(s.id); } }}>
              <line x1={cx} y1={cy} x2={node.x} y2={node.y} stroke={s.color} strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
              <rect x={s.map.x} y={s.map.y} width={s.map.w} height={s.map.h} fill={s.color} fillOpacity={sel ? 0.4 : 0.14} stroke={sel ? "var(--champagne)" : s.color} strokeWidth={sel ? 3 : 1.5} />
              {!compact && <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--fg)" fontSize="13" fontFamily="var(--font-mono)" letterSpacing="1">{s.name}</text>}
            </g>
          );
        })}
        {/* route */}
        {routePts && <polyline points={routePts} fill="none" stroke="var(--cyan)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 10"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.2s" repeatCount="indefinite" /></polyline>}
        {/* scene nodes */}
        {scenes.map((s) => {
          const here = s.id === currentSceneId;
          return (
            <g key={s.id} data-pop role="button" tabIndex={0} aria-label={L(s.title)} aria-current={here} style={{ cursor: "pointer" }}
              onClick={() => onScene(s.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onScene(s.id); } }}>
              {here && <circle cx={s.map.x} cy={s.map.y} r="22" fill="none" stroke="var(--champagne)" strokeWidth="2"><animate attributeName="r" values="14;30" dur="1.8s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.9;0" dur="1.8s" repeatCount="indefinite" /></circle>}
              <circle cx={s.map.x} cy={s.map.y} r="22" fill="transparent" />
              <circle cx={s.map.x} cy={s.map.y} r={here ? 11 : 8} fill={here ? "var(--champagne)" : "var(--bg)"} stroke={here ? "var(--bg)" : "var(--fg)"} strokeWidth="2" />
              {liftScenes.has(s.id) && <rect x={s.map.x + 14} y={s.map.y - 22} width="16" height="16" fill="var(--cyan)" opacity="0.9"><title>Lift</title></rect>}
              {!compact && (
                <text x={s.map.x} y={s.map.y + (s.id === "entrance" ? 36 : 34)} textAnchor="middle" fill={here ? "var(--champagne)" : "var(--fg-2)"} fontSize="12" fontFamily="var(--font-mono)" letterSpacing={locale === "ar" ? 0 : 1.5} style={{ textTransform: locale === "ar" ? "none" : "uppercase" }}>
                  {L(s.title)}
                </text>
              )}
            </g>
          );
        })}
        {current && current.floorId === floorId && !compact && (
          <text x={current.map.x} y={current.map.y - 26} textAnchor="middle" fill="var(--champagne)" fontSize="11" fontFamily="var(--font-mono)">▼ {t("xp.you")}</text>
        )}
      </g>
    </svg>
  );
}
