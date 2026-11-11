"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers";

/** Live countdown to the end of `endDate` (YYYY-MM-DD). Renders nothing until mounted to avoid hydration drift. */
export default function Countdown({ endDate, big = false }: { endDate: string; big?: boolean }) {
  const { t, num } = useApp();
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(endDate + "T23:59:59").getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endDate]);

  if (left === null) return <div className={big ? "h-20" : "h-9"} aria-hidden />;
  if (left === 0) return <p className="mono-label !text-fg3">{t("offers.ended")}</p>;
  const s = Math.floor(left / 1000);
  const parts: [number, string][] = [[Math.floor(s / 86400), t("offers.d")], [Math.floor((s % 86400) / 3600), t("offers.h")], [Math.floor((s % 3600) / 60), t("offers.m")], [s % 60, t("offers.s")]];
  return (
    <div className="flex"><div role="timer" aria-label={`${t("offers.endsIn")} ${parts.map(([n, u]) => `${n} ${u}`).join(" ")}`} className="flex items-end gap-3" dir="ltr">
      {parts.map(([n, u], i) => (
        <div key={i} className="text-center">
          <div className={`font-light tabular-nums leading-none text-champagne ${big ? "text-5xl md:text-7xl" : "text-xl"}`}>{num(n).padStart(2, "0")}</div>
          <div className="mono-label mt-1 !text-[10px] !text-fg3">{u}</div>
        </div>
      ))}
    </div></div>
  );
}
