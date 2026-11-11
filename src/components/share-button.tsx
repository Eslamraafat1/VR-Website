"use client";

import { useState } from "react";
import { useApp } from "./providers";
import { IconShare } from "./ui/icons";

/** Native share sheet on phones; copies the link elsewhere. */
export default function ShareButton({ title, className = "btn", iconOnly = false }: { title: string; className?: string; iconOnly?: boolean }) {
  const { t } = useApp();
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch { /* share cancelled or clipboard unavailable */ }
  };
  return <button type="button" onClick={share} title={t("share.label")} className={`${className} vx-press`}><IconShare width={16} /> <span aria-live="polite" className={iconOnly ? "sr-only" : undefined}>{done ? t("share.copied") : t("share.label")}</span></button>;
}
