import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/layout/CategoryBar";
import { getProducts, getCategories } from "@/lib/api";
import SearchResultsClient from "./SearchResultsClient";
import { Suspense } from "react";
import { ProductSectionSkeleton } from "@/components/skeletons/ProductSkeleton";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const categories = await getCategories();
  
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      <CategoryBar categories={categories} />
      
      <main className="flex-1 pp-container px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            {q ? `Search results for "${q}"` : "Search Products"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Discover the best deals on Pillipot Marketplace
          </p>
        </div>

        <Suspense fallback={<ProductSectionSkeleton />}>
          <SearchResults query={q} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const products = await getProducts(undefined, query);
  
  return <SearchResultsClient products={products} query={query} />;
}
