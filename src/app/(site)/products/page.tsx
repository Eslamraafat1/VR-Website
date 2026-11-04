import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { Suspense } from "react";
import ProductsExplorer from "@/components/pages/products-explorer";

export const metadata: Metadata = pageMetadata({ title: "Products", path: "/products", description: "Explore products from VISTRA stores and filter by store and category." });
export default function Page() { return <Suspense fallback={null}><ProductsExplorer /></Suspense>; }
