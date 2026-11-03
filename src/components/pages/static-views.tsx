"use client";

import { useState } from "react";
import { useApp } from "@/components/providers";
import Reveal from "@/components/reveal";
import { PortalLink } from "@/components/portal";
import { IconArrow } from "@/components/ui/icons";
import { PageHeader } from "./directory";
import type { DictKey } from "@/i18n/dict";

export function AboutView() {
  const { t } = useApp();
  const vals = [["about.v1t", "about.v1d"], ["about.v2t", "about.v2d"], ["about.v3t", "about.v3d"]] as const;
  return (
    <>
      <PageHeader kicker="VISTRA® / 08" title={t("about.title")} />
      <section className="gutter grid gap-10 py-16 md:grid-cols-2">
        <img src="/images/mall/detail-gallery.jpg" alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
        <div className="flex flex-col justify-center gap-6 text-lg text-fg2"><p className="thin text-2xl text-fg">{t("about.p1")}</p><p>{t("about.p2")}</p>
          <div><PortalLink href="/experience" className="btn btn-solid" data-cursor="enter">{t("explore.enter")} <IconArrow width={16} /></PortalLink></div></div>
      </section>
      <section className="gutter grid gap-px border-y border-line bg-[var(--line)] md:grid-cols-3">
        {vals.map(([a, b], i) => <Reveal key={a} className="bg-bg p-10" delay={i * 0.08}><p className="mono-label mb-6 text-champagne" dir="ltr">0{i + 1}</p><h2 className="display-m !text-4xl">{t(a)}</h2><p className="mt-4 text-fg2">{t(b)}</p></Reveal>)}
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
      <PageHeader kicker="VISTRA® / 09" title={t("contact.title")}><p className="thin mt-6 max-w-xl text-xl text-fg2">{t("contact.lead")}</p></PageHeader>
      <section className="gutter grid gap-16 py-14 md:grid-cols-[1.3fr_1fr]">
        {done ? <p role="status" className="border border-champagne p-8 text-lg">{t("contact.ok")}</p> : (
          <form onSubmit={submit} noValidate className="space-y-7">
            {fld("name", "contact.name")}{fld("email", "contact.email", "email")}{fld("subject", "contact.subject")}{fld("message", "contact.message")}
            <button type="submit" className="btn btn-solid">{t("contact.send")}</button>
            <p className="text-xs text-fg3">{t("contact.demo")}</p>
          </form>
        )}
        <aside className="space-y-8">
          <div><p className="mono-label mb-2 text-champagne">{t("contact.visit")}</p><p>{t("contact.address")}</p><p className="text-fg2">{t("contact.hours")}</p></div>
          <div><p className="mono-label mb-2 text-champagne">Email</p><p dir="ltr">hello@vistra.example</p></div>
          <img src="/images/mall/entrance.jpg" alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
        </aside>
      </section>
    </>
  );
}
