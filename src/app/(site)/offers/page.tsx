import type { Metadata } from "next";
import OffersView from "@/components/pages/offers-view";

export const metadata: Metadata = { title: "Offers & promotions" };
export default function Page() { return <OffersView />; }
