import type { Metadata } from "next";
import ExperienceLoader from "@/components/experience/experience-loader";

export const metadata: Metadata = { title: "Virtual Mall Explorer" };

export default function ExperiencePage() {
  return <ExperienceLoader />;
}
