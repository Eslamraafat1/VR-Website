import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import OffersView from "@/components/pages/offers-view";

export const metadata: Metadata = pageMetadata({ title: "Offers & promotions", path: "/offers", description: "Current offers and promotions from stores in the VISTRA virtual mall." });
export default function Page() { return <OffersView />; }
