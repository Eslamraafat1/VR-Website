"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useApp } from "@/components/providers";
import Reveal from "@/components/reveal";
import { PortalLink } from "@/components/portal";
import { IconArrow } from "@/components/ui/icons";
import { PageHeader } from "./directory";
import type { DictKey } from "@/i18n/dict";
import ScrollWords from "@/components/fx/scroll-words";
import Parallax from "@/components/fx/parallax";
import GoldDust from "@/components/fx/gold-dust";
import CountUp from "@/components/fx/count-up";
import Spotlight from "@/components/fx/spotlight";
import { getFloors, getProducts, getScenes, getStores } from "@/data/service";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap";

/** Image that opens from an inset clip as it scrolls into view, with parallax inside. */
function RevealFrame({ src, className }: { src: string; className: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const tw = gsap.fromTo(el, { clipPath: "inset(12% 8% 12% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 30%", scrub: true } });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); ScrollTrigger.refresh(); gsap.set(el, { clearProps: "clipPath" }); };
  }, []);
  return <div ref={box} className={`relative overflow-hidden ${className}`}><Parallax><img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /></Parallax></div>;
}

export function AboutView() {
  const { t, num } = useApp();
  const stats: [number, DictKey][] = [[getStores().length, "explore.stores"], [getScenes().length, "explore.experiences"], [getFloors().length, "dir.floor"], [getProducts().length, "nav.products"]];
  const vals = [["about.v1t", "about.v1d"], ["about.v2t", "about.v2d"], ["about.v3t", "about.v3d"]] as const;
  return (
    <>
      <div className="relative overflow-hidden"><GoldDust className="z-[1]" /><PageHeader kicker="VISTRA® / 08" title={t("about.title")} /></div>
      <section className="gutter grid gap-10 py-16 md:grid-cols-2">
        <RevealFrame src="/images/mall/detail-gallery.jpg" className="aspect-[4/5] w-full" />
        <div className="flex flex-col justify-center gap-6 text-lg text-fg2"><ScrollWords text={t("about.p1")} className="thin text-2xl text-fg" /><p>{t("about.p2")}</p>
          <div><PortalLink href="/experience" className="btn btn-solid" data-cursor="enter">{t("explore.enter")} <IconArrow width={16} /></PortalLink></div></div>
      </section>
      <section className="gutter grid grid-cols-2 gap-px border-t border-line bg-[var(--line)] md:grid-cols-4">
        {stats.map(([n, k]) => <div key={k} className="bg-bg p-8 text-center"><p className="text-5xl font-extralight text-champagne md:text-6xl"><CountUp to={n} format={num} /></p><p className="mono-label mt-3">{t(k)}</p></div>)}
      </section>
      <section className="gutter grid gap-px border-y border-line bg-[var(--line)] md:grid-cols-3">
        {vals.map(([a, b], i) => <Reveal key={a} className="bg-bg" delay={i * 0.08}><Spotlight><div className="h-full p-10"><p className="mono-label mb-6 text-champagne" dir="ltr">0{i + 1}</p><h2 className="display-m !text-4xl">{t(a)}</h2><p className="mt-4 text-fg2">{t(b)}</p></div></Spotlight></Reveal>)}
      </section>
    </>
  );
}

export function LegalView({ kind }: { kind: "privacy" | "terms" }) {
  const { t } = useApp();
  const secs = [1, 2, 3].map((n) => [`${kind}.${n}h`, `${kind}.${n}p`] as [DictKey, DictKey]);
  return (
    <>
      <PageHeader kicker="VISTRA® / LEGAL" title={t(`${kind}.title` as DictKey)}><p className="mono-label mt-4">{t("legal.updated")}</p></PageHeader>
      <section className="gutter max-w-3xl space-y-10 py-14">
        {secs.map(([h, p]) => <div key={h}><h2 className="mb-3 text-2xl font-medium">{t(h)}</h2><p className="text-fg2">{t(p)}</p></div>)}
      </section>
    </>
  );
}

function CopyBtn({ value }: { value: string }) {
  const { t } = useApp();
  const [ok, setOk] = useState(false);
  return <button type="button" className="mono-label border border-line px-2 py-1 transition-colors hover:border-champagne hover:!text-champagne" onClick={() => { navigator.clipboard?.writeText(value).then(() => { setOk(true); window.setTimeout(() => setOk(false), 1800); }).catch(() => {}); }}><span aria-live="polite">{ok ? t("contact.copied") : t("contact.copy")}</span></button>;
}

/** Live open/closed badge for the 10:00–23:00 daily hours. */
function OpenNow() {
  const { t } = useApp();
  const open = useSyncExternalStore(() => () => {}, () => { const h = new Date().getHours(); return h >= 10 && h < 23; }, () => null);
  if (open === null) return null;
  return <p className="mono-label mt-3 flex items-center gap-2"><span className={`inline-block size-2 rounded-full ${open ? "animate-pulse bg-cyan" : "bg-fg3"}`} />{open ? t("contact.open") : t("contact.closed")}</p>;
}

export function ContactView() {
  const { t } = useApp();
  const [v, setV] = useState({ name: "", email: "", subject: "", message: "" });
  const [err, setErr] = useState<Partial<Record<keyof typeof v, string>>>({});
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val.slice(0, k === "message" ? 1200 : 120) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: typeof err = {};
    if (!v.name.trim()) n.name = t("val.required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) n.email = t("val.email");
    if (!v.subject.trim()) n.subject = t("val.required");
    if (v.message.trim().length < 10) n.message = t("val.min");
    setErr(n);
    if (!Object.keys(n).length) setDone(true); // demo only: nothing is sent
  };
  const fld = (k: keyof typeof v, label: DictKey, type = "text") => (
    <label className="block">
      <span className="mono-label">{t(label)}</span>
      {k === "message" ? <textarea className="field min-h-32" value={v[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!err[k]} aria-describedby={err[k] ? `${k}-e` : undefined} />
        : <input className="field" type={type} value={v[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!err[k]} aria-describedby={err[k] ? `${k}-e` : undefined} autoComplete={k === "email" ? "email" : k === "name" ? "name" : "off"} />}
      {err[k] && <span id={`${k}-e`} role="alert" className="mt-1 block text-sm text-[#ff6b6b]">{err[k]}</span>}
    </label>
  );
  return (
    <>
      <div className="relative overflow-hidden"><GoldDust className="z-[1]" /><PageHeader kicker="VISTRA® / 09" title={t("contact.title")}><p className="thin mt-6 max-w-xl text-xl text-fg2">{t("contact.lead")}</p></PageHeader></div>
      <section className="gutter grid gap-16 py-14 md:grid-cols-[1.3fr_1fr]">
        {done ? <div role="status" className="flex items-start gap-5 border border-champagne p-8 text-lg"><svg aria-hidden width="44" height="44" viewBox="0 0 44 44" className="shrink-0 text-champagne"><circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="vx-draw" pathLength="1" /><path d="M13 23l6 6 12-13" fill="none" stroke="currentColor" strokeWidth="2" className="vx-draw vx-draw-2" pathLength="1" /></svg><p>{t("contact.ok")}</p></div> : (
          <form onSubmit={submit} noValidate className="space-y-7">
            {fld("name", "contact.name")}{fld("email", "contact.email", "email")}{fld("subject", "contact.subject")}{fld("message", "contact.message")}
            <p className="mono-label -mt-4 text-end !text-fg3" dir="ltr" aria-hidden>{v.message.length} / 1200</p>
            <button type="submit" className="btn btn-solid">{t("contact.send")}</button>
            <p className="text-xs text-fg3">{t("contact.demo")}</p>
          </form>
        )}
        <aside className="space-y-8">
          <div><p className="mono-label mb-2 text-champagne">{t("contact.visit")}</p><p>{t("contact.address")}</p><p className="text-fg2">{t("contact.hours")}</p><OpenNow /></div>
          <div><p className="mono-label mb-2 text-champagne">Email</p><div className="flex items-center gap-4"><p dir="ltr">hello@vistra.example</p><CopyBtn value="hello@vistra.example" /></div></div>
          <RevealFrame src="/images/mall/entrance.jpg" className="aspect-[4/3] w-full" />
        </aside>
      </section>
    </>
  );
}
