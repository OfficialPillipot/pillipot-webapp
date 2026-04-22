"use client";

import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/api";
import { Frown } from "lucide-react";
import Link from "next/link";

export default function SearchResultsClient({ products, query }: { products: Product[], query: string }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/60 bg-white/78 px-4 py-24 text-center pp-shadow">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
          <Frown className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="mb-2 text-2xl font-black tracking-[-0.04em] text-slate-950">No results found for &quot;{query}&quot;</h2>
        <p className="mb-8 max-w-md text-sm leading-7 text-slate-500">
          We couldn&apos;t find any products matching your search. Try checking for typos or using more general terms.
        </p>
        <Link 
          href="/" 
          className="pp-button-primary rounded-full px-8 py-3 text-sm font-bold"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-[1.6rem] border border-white/60 bg-white/68 px-5 py-4 pp-shadow">
        <p className="text-sm font-medium text-slate-600">
          Showing <span className="font-black text-pp-primary">{products.length}</span> results
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
