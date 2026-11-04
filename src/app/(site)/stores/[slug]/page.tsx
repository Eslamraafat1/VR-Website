import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { notFound } from "next/navigation";
import StoreView from "@/components/pages/store-view";
import { getStore, getStores } from "@/data/service";

export const dynamicParams = false;
export const generateStaticParams = () => getStores().map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getStore(slug);
  return pageMetadata({ title: s?.name ?? "Store", description: s?.description.en, path: `/stores/${slug}`, image: s?.coverImage });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const store = getStore((await params).slug);
  if (!store) notFound();
  return <StoreView store={store} />;
}
