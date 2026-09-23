"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { LuStar } from "react-icons/lu";

interface FilterSidebarProps {
  categoryName: string;
}

export default function FilterSidebar({ categoryName }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "150000");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");

  useEffect(() => {
    setMaxPrice(searchParams.get("maxPrice") || "150000");
    setMinRating(searchParams.get("minRating") || "");
  }, [searchParams]);

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
    <aside className="hidden lg:flex w-[300px] shrink-0 flex-col rounded-[1.8rem] border border-white/60 bg-white/72 pp-shadow">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-black tracking-[-0.03em] text-slate-950">Filters</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="border-b border-slate-100 p-5">
          <span className="mb-4 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Category</span>
          <nav className="text-sm font-bold text-slate-600">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-pp-primary">
              <span className="text-slate-400">‹</span> {categoryName}
            </div>
          </nav>
        </div>

        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Price</span>
            <button
              onClick={() => {
                setMaxPrice("150000");
                updateFilters({ maxPrice: "" });
              }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-pp-primary hover:underline"
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
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-pp-primary"
            />
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-bold text-slate-400">
                ₹0
              </div>
              <span className="text-slate-300">to</span>
              <div
                suppressHydrationWarning
                className="flex-1 rounded-xl border border-pp-cyan/20 bg-pp-surface-alt px-2 py-2 text-center text-xs font-black text-pp-primary"
              >
                ₹{Number(maxPrice || 0).toLocaleString("en-IN")}
                {maxPrice === "150000" && "+"}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 p-5">
          <span className="mb-4 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Customer Ratings</span>
          <div className="space-y-2.5">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="group flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 hover:bg-slate-50"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={minRating === rating.toString()}
                    onChange={() => handleRatingChange(rating.toString())}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-slate-200 checked:border-pp-primary checked:bg-pp-primary transition-all"
                  />
                  <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 transition-colors group-hover:text-pp-primary">
                  <span>{rating}</span>
                  <LuStar className="h-3.5 w-3.5 fill-pp-yellow text-pp-yellow" />
                  <span>& above</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
