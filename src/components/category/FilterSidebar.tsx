"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface FilterSidebarProps {
  categoryName: string;
}

export default function FilterSidebar({ categoryName }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "0");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "150000");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`?${params.toString()}`);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaxPrice(val);
  };

  const handlePriceCommit = () => {
    updateFilters({ maxPrice });
  };

  const handleRatingChange = (rating: string) => {
    const newVal = minRating === rating ? "" : rating;
    setMinRating(newVal);
    updateFilters({ minRating: newVal });
  };

  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Category Info */}
        <div className="p-4 border-b border-gray-100">
          <span className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 block">Categories</span>
          <nav className="text-sm text-gray-600 font-bold">
            <div className="flex items-center gap-2 cursor-pointer hover:text-pp-primary transition-colors">
              <span className="text-gray-400">‹</span> {categoryName}
            </div>
          </nav>
        </div>

        {/* Price Filter */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Price</span>
            <button 
              onClick={() => {
                setMaxPrice("150000");
                updateFilters({ maxPrice: "" });
              }}
              className="text-[10px] font-black text-pp-primary uppercase tracking-widest hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="px-2">
            <input 
              type="range" 
              min="0" 
              max="150000" 
              step="500"
              value={maxPrice}
              onChange={handlePriceChange}
              onMouseUp={handlePriceCommit}
              onTouchEnd={handlePriceCommit}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pp-primary" 
            />
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-400 text-center">
                ₹0
              </div>
              <span className="text-gray-300">to</span>
              <div className="flex-1 border-2 border-pp-primary/20 bg-pp-primary/5 rounded-lg px-2 py-2 text-xs font-black text-pp-primary text-center">
                ₹{Number(maxPrice).toLocaleString()}
                {maxPrice === "150000" && "+"}
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Filter */}
        <div className="p-4 border-b border-gray-100">
          <span className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 block">Customer Ratings</span>
          <div className="space-y-2.5">
            {[4, 3, 2, 1].map((rating) => (
              <label 
                key={rating} 
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={minRating === rating.toString()}
                    onChange={() => handleRatingChange(rating.toString())}
                    className="peer appearance-none w-4 h-4 border-2 border-gray-200 rounded checked:bg-pp-primary checked:border-pp-primary transition-all cursor-pointer"
                  />
                  <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600 group-hover:text-pp-primary transition-colors">
                  <span>{rating}★ & above</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
