import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsExplorer from "@/components/pages/products-explorer";

export const metadata: Metadata = { title: "Products" };
export default function Page() { return <Suspense fallback={null}><ProductsExplorer /></Suspense>; }
