import type { Metadata } from "next";
import { Suspense } from "react";
import StoreDirectory from "@/components/pages/directory";

export const metadata: Metadata = { title: "Store directory" };
export default function Page() { return <Suspense fallback={null}><StoreDirectory /></Suspense>; }
