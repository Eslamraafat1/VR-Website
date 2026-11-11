"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./providers";
import { IconBag, IconCube, IconHome, IconPin, IconTag } from "./ui/icons";
import type { DictKey } from "@/i18n/dict";

const ITEMS: { href: string; key: DictKey; Icon: typeof IconHome; hero?: boolean }[] = [
  { href: "/", key: "nav.home", Icon: IconHome },
  { href: "/stores", key: "nav.stores", Icon: IconPin },
  { href: "/experience", key: "dock.mall", Icon: IconCube, hero: true },
  { href: "/products", key: "nav.products", Icon: IconBag },
  { href: "/offers", key: "nav.offers", Icon: IconTag },
];

/** Thumb-reach navigation bar for phones. Hidden from lg up, where the header carries the links. */
export default function MobileDock() {
  const { t } = useApp();
  const pathname = usePathname();
  return (
    <nav aria-label="Quick" className="vx-dock fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-end px-1">
        {ITEMS.map(({ href, key, Icon, hero }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex justify-center">
              <Link href={href} aria-current={active ? "page" : undefined}
                className={`vx-press relative flex min-h-14 w-full flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider ${active ? "text-champagne" : "text-fg2"}`}>
                {hero ? (
                  <span className="-mt-5 grid size-12 place-items-center rounded-full border border-champagne bg-champagne text-[var(--on-accent)] shadow-[0_6px_24px_-6px_var(--champagne)]"><Icon width={22} height={22} /></span>
                ) : <Icon width={22} height={22} />}
                <span className="max-w-full truncate px-0.5">{t(key)}</span>
                {active && !hero && <span aria-hidden className="absolute inset-x-5 top-0 h-px bg-champagne" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
