"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/providers";
import Reveal from "@/components/reveal";
import Magnetic from "@/components/ui/magnetic";
import { PortalLink } from "@/components/portal";
import { IconArrow } from "@/components/ui/icons";
import { LivingImage } from "@/components/store-card";
import OfferCard from "@/components/offer-card";
import PanoStrip from "./pano-strip";
import CountUp from "@/components/fx/count-up";
import Spotlight from "@/components/fx/spotlight";
import CarouselProgress from "@/components/fx/carousel-progress";
import { getCategories, getExperiences, getFloors, getMall, getOffers, getScenes, getStores } from "@/data/service";
import { prefersReducedMotion, registerGsap } from "@/lib/gsap";

const SectionHead = ({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) => (
  <Reveal className="gutter mb-12 flex flex-wrap items-end justify-between gap-6">
    <div><p className="mono-label mb-4 text-champagne">{kicker}</p><h2 className="display-m max-w-3xl">{title}</h2></div>
    {action}
  </Reveal>
);

/* ---------------- B. Explore the virtual mall ---------------- */
export function ExploreSection() {
  const { t, L, floorName, num } = useApp();
  const mall = getMall();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const tween = gsap.fromTo(el, { clipPath: "inset(14% 10% 14% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 25%", scrub: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); ScrollTrigger.refresh(); };
  }, []);

  const stats: [number, string][] = [
    [getStores().length, t("explore.stores")],
    [getScenes().length, t("explore.experiences")],
    [getFloors().length, t("dir.floor")],
  ];
  return (
    <section className="relative py-24 md:py-36" aria-labelledby="explore-title">
      <div className="gutter mb-10 grid gap-6 md:grid-cols-2 md:items-end">
        <Reveal><p className="mono-label mb-4 text-champagne">{t("explore.kicker")}</p><h2 id="explore-title" className="display-m">{t("explore.title")}</h2></Reveal>
        <Reveal delay={0.1}><p className="thin max-w-lg text-lg text-fg2">{t("explore.text")}</p></Reveal>
      </div>
      <div ref={box} className="relative h-[75vh] min-h-[480px] overflow-hidden">
        <PanoStrip src="/panoramas/atrium.jpg" className="absolute inset-0" label={`${mall.name} — 360°`} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-8 p-6 text-[#f4f1ea] md:p-12">
          <div>
            <p className="mono-label !text-[#f4f1ea]/70">{t("explore.drag")}</p>
            <h3 className="display-m mt-2">{mall.name}</h3>
            <p className="mono-label mt-3 !text-[#f4f1ea]/80">{t("explore.floor")}: {floorName("ground")}</p>
          </div>
          <dl className="flex gap-8">
            {stats.map(([n, l]) => <div key={l}><dd className="text-4xl font-light md:text-5xl"><CountUp to={n} format={num} /></dd><dt className="mono-label mt-1 !text-[#f4f1ea]/70">{l}</dt></div>)}
          </dl>
          <Magnetic><PortalLink href="/experience" className="btn btn-solid" data-cursor="enter">{t("explore.enter")} <IconArrow width={16} /></PortalLink></Magnetic>
        </div>
      </div>
      <span className="sr-only">{L(mall.description)}</span>
    </section>
  );
}

/* ---------------- C. Discover the stores ---------------- */
const TILE = ["max-md:col-span-2 md:col-span-7 md:row-span-2 aspect-[4/3] md:aspect-auto md:min-h-[34rem]", "md:col-span-5 aspect-[4/5] md:aspect-[4/3]", "md:col-span-5 aspect-[4/5] md:aspect-[4/3]", "md:col-span-4 aspect-[4/5]", "md:col-span-4 aspect-[4/5]", "md:col-span-4 aspect-[4/5]", "md:col-span-8 aspect-[4/5] md:aspect-[16/9]", "max-md:col-span-2 md:col-span-4 aspect-[16/10] md:aspect-[4/5]"];

export function StoresSection() {
  const { t, cat } = useApp();
  const tiles = getCategories().map((c) => ({ c, store: getStores().find((s) => s.category === c)! }));
  return (
    <section className="py-24 md:py-36" aria-labelledby="stores-title">
      <SectionHead kicker={t("stores.kicker")} title={t("stores.title")} action={<Link href="/stores" className="btn" data-cursor="discover">{t("stores.all")} <IconArrow width={16} /></Link>} />
      <h2 id="stores-title" className="sr-only">{t("stores.title")}</h2>
      <div className="gutter grid grid-cols-2 gap-2.5 md:grid-cols-12 md:gap-4">
        {tiles.map(({ c, store }, i) => (
          <Reveal key={c} className={`${TILE[i]}`} delay={(i % 3) * 0.08}>
            <Spotlight><Link href={`/stores?category=${c}`} data-cursor="view" className="group relative block h-full w-full overflow-hidden bg-surface" aria-label={`${cat(c)} — ${store.name}`}>
              <LivingImage src={store.coverImage} alt="" className="absolute inset-0 transition-[clip-path] duration-700 [clip-path:inset(0_0_0_0)] group-hover:[clip-path:inset(4%_4%_4%_4%)]" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
              <span className="mono-label absolute start-4 top-4 !text-white" dir="ltr"><span className="inline-block transition-transform duration-500 group-hover:-translate-y-0.5">{String(i + 1).padStart(2, "0")}</span> / 08</span>
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-5 md:p-7">
                <p className="mono-label hidden translate-y-3 !text-champagne opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:block">{store.name}</p>
                <h3 className="display-m !text-2xl md:!text-4xl">{cat(c)}</h3>
                <p className="mono-label mt-3 flex items-center gap-2 !text-white/80">{t("stores.view")} <IconArrow width={14} className="transition-transform group-hover:translate-x-1" /></p>
              </div>
            </Link></Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- D. Featured experiences ---------------- */
export function ExperiencesSection() {
  const { t, L } = useApp();
  return (
    <section className="py-24 md:py-36" aria-labelledby="exp-title">
      <SectionHead kicker={t("exp.kicker")} title={t("exp.title")} />
      <h2 id="exp-title" className="sr-only">{t("exp.title")}</h2>
      <CarouselProgress className="scrollbar-none gutter flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 pb-2 md:gap-4">
        {getExperiences().map((e, i) => (
          <Link key={e.id} href={`/experience?scene=${e.sceneId}`} data-cursor="explore" style={{ ["--tone" as string]: e.tone }}
            className="group relative block h-[58svh] min-h-[400px] w-[82vw] shrink-0 snap-start overflow-hidden border border-line sm:w-[46vw] lg:w-[30vw]">
            <img src={e.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-start scale-x-0 bg-[var(--tone)] transition-transform duration-700 group-hover:scale-x-100" style={{ transformOrigin: "left" }} />
            <span className="absolute start-5 top-5 text-7xl font-extralight text-[var(--tone)] opacity-90" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="mono-label mb-2 !text-[var(--tone)]">{L(e.tagline)}</p>
              <h3 className="display-m !text-4xl">{L(e.title)}</h3>
              <p className="mono-label mt-4 flex items-center gap-2 !text-white">{t("exp.go")} <IconArrow width={14} /></p>
            </div>
          </Link>
        ))}
      </CarouselProgress>
    </section>
  );
}

/* ---------------- E. Featured offers ---------------- */
export function OffersSection() {
  const { t } = useApp();
  const offers = getOffers().slice(0, 3);
  return (
    <section className="py-24 md:py-36" aria-labelledby="offers-title">
      <SectionHead kicker={t("offers.kicker")} title={t("offers.title")} action={<Link href="/offers" className="btn" data-cursor="discover">{t("offers.all")} <IconArrow width={16} /></Link>} />
      <h2 id="offers-title" className="sr-only">{t("offers.title")}</h2>
      <div className="gutter grid gap-4 md:grid-cols-3">
        {offers.map((o, i) => <Reveal key={o.id} delay={i * 0.1}><OfferCard offer={o} /></Reveal>)}
      </div>
    </section>
  );
}

/* ---------------- F. How it works ---------------- */
const STEPS = [
  { n: "01", t: "how.1t", d: "how.1d", img: "/images/mall/entrance.jpg" },
  { n: "02", t: "how.2t", d: "how.2d", img: "/images/mall/atrium.jpg" },
  { n: "03", t: "how.3t", d: "how.3d", img: "/images/mall/luxury-avenue.jpg" },
] as const;

export function HowItWorks() {
  const { t } = useApp();
  const [step, setStep] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-step]").forEach((s, i) => {
        ScrollTrigger.create({ trigger: s, start: "top 60%", end: "bottom 60%", onToggle: (self) => { if (self.isActive) setStep(i); } });
      });
      if (!prefersReducedMotion() && line.current) gsap.fromTo(line.current, { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: true } });
    }, el);
    return () => { ctx.revert(); ScrollTrigger.refresh(); };
  }, []);

  return (
    <section className="py-24 md:py-36" aria-labelledby="how-title">
      <div className="gutter mb-12"><p className="mono-label mb-4 text-champagne">{t("how.kicker")}</p><h2 id="how-title" className="display-m">{t("brand.tagline")}</h2></div>
      <div ref={wrap} className="gutter relative grid gap-10 md:grid-cols-2">
        <div className="relative hidden md:block">
          <div className="sticky top-28 aspect-[4/5] overflow-hidden border border-line">
            {STEPS.map((s, i) => <img key={s.n} src={s.img} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${i === step ? "scale-100 opacity-100" : "scale-110 opacity-0"}`} />)}
            <span className="absolute bottom-4 end-4 text-8xl font-extralight text-white/90" dir="ltr">{STEPS[step].n}</span>
          </div>
        </div>
        <div className="relative ps-10">
          <div aria-hidden className="absolute inset-y-0 start-0 w-px bg-line"><div ref={line} className="h-full w-px bg-champagne" /></div>
          {STEPS.map((s, i) => (
            <div key={s.n} data-step className="flex min-h-[60vh] flex-col justify-center gap-5 py-10">
              <img src={s.img} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover md:hidden" />
              <span className={`text-7xl font-extralight transition-colors duration-500 ${i === step ? "text-champagne" : "text-fg3"}`} dir="ltr">{s.n}</span>
              <h3 className="display-m">{t(s.t)}</h3>
              <p className="thin max-w-md text-xl text-fg2">{t(s.d)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- G. Closing ---------------- */
export function ClosingSection() {
  const { t } = useApp();
  return (
    <section className="relative isolate overflow-hidden py-32 md:py-48" aria-labelledby="close-title">
      <img src="/images/mall/detail-skylight.jpg" alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]" />
      <div className="gutter text-center">
        <Reveal><h2 id="close-title" className="display"><span className="block">{t("close.l1")}</span><span className="block text-champagne">{t("close.l2")}</span></h2></Reveal>
        <Reveal delay={0.15} className="mt-12"><Magnetic><PortalLink href="/experience" className="btn btn-solid !min-h-14 !px-10" data-cursor="enter">{t("close.cta")} <IconArrow width={16} /></PortalLink></Magnetic></Reveal>
      </div>
    </section>
  );
}
