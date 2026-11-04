import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { ContactView } from "@/components/pages/static-views";

export const metadata: Metadata = pageMetadata({ title: "Contact", path: "/contact", description: "Contact the VISTRA virtual mall team (demo form)." });
export default function Page() { return <ContactView />; }
