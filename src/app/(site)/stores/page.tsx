import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { Suspense } from "react";
import StoreDirectory from "@/components/pages/directory";

export const metadata: Metadata = pageMetadata({ title: "Store directory", path: "/stores", description: "Browse every store in the VISTRA virtual mall by floor and category." });
export default function Page() { return <Suspense fallback={null}><StoreDirectory /></Suspense>; }
