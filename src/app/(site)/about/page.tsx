import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { AboutView } from "@/components/pages/static-views";

export const metadata: Metadata = pageMetadata({ title: "About", path: "/about", description: "About VISTRA, a concept for exploring a shopping mall in 360° before you visit." });
export default function Page() { return <AboutView />; }
