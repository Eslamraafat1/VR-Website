import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoreView from "@/components/pages/store-view";
import { getStore, getStores } from "@/data/service";

export const dynamicParams = false;
export const generateStaticParams = () => getStores().map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getStore((await params).slug);
  return { title: s?.name ?? "Store", description: s?.description.en };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const store = getStore((await params).slug);
  if (!store) notFound();
  return <StoreView store={store} />;
}
