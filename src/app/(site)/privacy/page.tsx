import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { LegalView } from "@/components/pages/static-views";

export const metadata: Metadata = pageMetadata({ title: "Privacy policy", path: "/privacy", description: "How the VISTRA virtual mall concept handles data (favourites and preferences stay in your browser)." });
export default function Page() { return <LegalView kind="privacy" />; }
