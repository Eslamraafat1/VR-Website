import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import ExperienceLoader from "@/components/experience/experience-loader";

export const metadata: Metadata = pageMetadata({ title: "Virtual Mall Explorer", path: "/experience", description: "Walk through 11 spaces over two floors in 360°, open stores from hotspots and get directions with the floor map." });

export default function ExperiencePage() {
  return <ExperienceLoader />;
}
