import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Pillipot Marketplace`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.imageUrl || ""],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      <ProductClient product={product} />
      <Footer />
    </div>
  );
}
