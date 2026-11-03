import type { Metadata } from "next";
import { LegalView } from "@/components/pages/static-views";

export const metadata: Metadata = { title: "Privacy policy" };
export default function Page() { return <LegalView kind="privacy" />; }
