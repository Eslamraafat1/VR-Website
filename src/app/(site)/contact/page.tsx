import type { Metadata } from "next";
import { ContactView } from "@/components/pages/static-views";

export const metadata: Metadata = { title: "Contact" };
export default function Page() { return <ContactView />; }
