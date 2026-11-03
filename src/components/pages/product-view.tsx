"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import ProductDetail from "@/components/product-detail";
import ProductModal from "@/components/product-modal";
import { ProductCard } from "./product-grid";
import { getProducts } from "@/data/service";
import type { Product } from "@/data/types";

export default function ProductView({ product }: { product: Product }) {
  const { t } = useApp();
  const [open, setOpen] = useState<Product | null>(null);
  const related = getProducts().filter((p) => p.id !== product.id && (p.storeId === product.storeId || p.category === product.category)).slice(0, 4);
  return (
    <>
      <nav className="gutter pt-10" aria-label="Breadcrumb"><Link href="/products" className="mono-label hover:text-champagne">← {t("nav.products")}</Link></nav>
      <section className="gutter py-8"><div className="border border-line"><ProductDetail product={product} /></div></section>
      <section className="gutter py-12">
        <h2 className="mono-label mb-6 text-champagne">{t("prod.related")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpen} />)}</div>
      </section>
      <ProductModal product={open} onClose={() => setOpen(null)} />
    </>
  );
}
