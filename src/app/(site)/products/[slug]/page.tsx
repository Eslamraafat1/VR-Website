import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/pages/product-view";
import { getProduct, getProducts } from "@/data/service";

export const dynamicParams = false;
export const generateStaticParams = () => getProducts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return { title: p?.name.en ?? "Product", description: p?.description.en, openGraph: { images: p ? [p.images[0]] : undefined } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <ProductView product={product} />;
}
