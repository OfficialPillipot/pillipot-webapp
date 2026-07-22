import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-[1.8rem] border border-gray-100 p-4 shadow-sm space-y-4">
      {/* Image Area */}
      <div className="relative w-full aspect-square bg-gray-100 animate-shimmer rounded-2xl" />
      
      <div className="space-y-2">
        {/* Brand Label */}
        <div className="h-3 bg-gray-100 animate-shimmer rounded w-1/4" />
        {/* Title */}
        <div className="h-5 bg-gray-100 animate-shimmer rounded w-3/4" />
        
        {/* Price & Rating Row */}
        <div className="flex items-center gap-3 mt-2">
          <div className="h-6 bg-gray-100 animate-shimmer rounded w-1/3" />
          <div className="h-5 bg-gray-100 animate-shimmer rounded-lg w-10" />
        </div>
      </div>
      
      {/* Button */}
      <div className="mt-2 h-12 bg-gray-100 animate-shimmer rounded-full w-full" />
    </div>
  );
}

export function ProductSectionSkeleton() {
  return (
    <section className="mb-10 px-4">
      <div className="flex flex-col gap-2 mb-6">
        <div className="h-3 bg-gray-100 animate-shimmer rounded w-24" />
        <div className="h-8 bg-gray-100 animate-shimmer rounded w-64" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5 sm:grid-cols-4 lg:grid-cols-5 xl:gap-4">
        {[...Array(5)].map((_, i) => {
          const visibilityClass =
            i < 3
              ? "block"
              : i === 3
              ? "hidden sm:block"
              : "hidden lg:block";
          return (
            <div key={i} className={visibilityClass}>
              <ProductSkeleton />
            </div>
          );
        })}
      </div>
    </section>
  );
}
