"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type Category } from "@/lib/api";

export default function SubcategoryFilter({ 
  subcategories, 
  categoryId 
}: { 
  subcategories: Category[];
  categoryId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSubId = searchParams.get("subcategory") || "";

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("subcategory", id);
    } else {
      params.delete("subcategory");
    }
    router.push(`/category/${categoryId}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-3 px-4 bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-[calc(4rem+4.75rem)] md:top-[calc(4rem+5rem)] z-20">
      <button
        onClick={() => handleSelect("")}
        className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
          currentSubId === ""
            ? "bg-pp-primary text-white border-pp-primary shadow-pp-primary/20 scale-105"
            : "bg-white text-gray-600 border-gray-100 hover:border-pp-primary/30 hover:bg-gray-50"
        }`}
      >
        All Products
      </button>
      {subcategories.map((sub) => (
        <button
          key={sub.id}
          onClick={() => handleSelect(sub.id)}
          className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
            currentSubId === sub.id
              ? "bg-pp-primary text-white border-pp-primary shadow-pp-primary/20 scale-105"
              : "bg-white text-gray-600 border-gray-100 hover:border-pp-primary/30 hover:bg-gray-50"
          }`}
        >
          {sub.name}
        </button>
      ))}
    </div>
  );
}
