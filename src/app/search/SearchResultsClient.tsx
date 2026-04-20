"use client";

import React from "react";
import ProductCard from "@/components/product/ProductCard";
import { type Product } from "@/lib/api";
import { Frown, Search } from "lucide-react";
import Link from "next/link";

interface SearchResultsClientProps {
  products: Product[];
  query: string;
}

export default function SearchResultsClient({ products, query }: { products: Product[], query: string }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Frown className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No results found for "{query}"</h2>
        <p className="text-gray-500 max-w-md mb-8">
          We couldn't find any products matching your search. Try checking for typos or using more general terms.
        </p>
        <Link 
          href="/" 
          className="bg-pp-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm font-medium">
          Showing <span className="text-pp-primary font-bold">{products.length}</span> results
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
