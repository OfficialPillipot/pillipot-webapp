import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getProduct } from "@/lib/api";
import { notFound } from "next/navigation";
import PersonalizeClient from "./PersonalizeClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Personalize Product" };

  return {
    title: `Personalize ${product.name} | Pillipot`,
    description: `Personalize ${product.name} with custom photo and text.`,
  };
}

export default async function PersonalizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <Header />
      <PersonalizeClient product={product} />
      <Footer />
    </div>
  );
}
