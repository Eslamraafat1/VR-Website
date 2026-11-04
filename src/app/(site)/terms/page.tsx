import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { LegalView } from "@/components/pages/static-views";

export const metadata: Metadata = pageMetadata({ title: "Terms of use", path: "/terms", description: "Terms of use for the VISTRA virtual mall concept." });
export default function Page() { return <LegalView kind="terms" />; }
