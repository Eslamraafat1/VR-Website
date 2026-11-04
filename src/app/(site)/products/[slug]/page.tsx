import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { notFound } from "next/navigation";
import ProductView from "@/components/pages/product-view";
import { getProduct, getProducts } from "@/data/service";

export const dynamicParams = false;
export const generateStaticParams = () => getProducts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return pageMetadata({ title: p?.name.en ?? "Product", description: p?.description.en, path: `/products/${slug}`, image: p?.images[0] });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <ProductView product={product} />;
}
