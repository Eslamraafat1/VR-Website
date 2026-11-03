"use client";

import { useState } from "react";
import Dialog from "./ui/dialog";
import ProductDetail, { RelatedProducts } from "./product-detail";
import { useApp } from "./providers";
import type { Product } from "@/data/types";

/** Modal showing a product with related items. `product` null = closed. */
export default function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { L } = useApp();
  const [override, setOverride] = useState<Product | null>(null);
  const current = override ?? product;
  const close = () => { setOverride(null); onClose(); };
  return (
    <Dialog open={!!product} onClose={close} label={current ? L(current.name) : "Product"} wide>
      {current && (
        <>
          <ProductDetail key={current.id} product={current} onNavigate={close} />
          <RelatedProducts product={current} onPick={setOverride} />
        </>
      )}
    </Dialog>
  );
}
