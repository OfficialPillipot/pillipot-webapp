import React from "react";

export default function BannerSkeleton() {
  return (
    <div className="pp-container pt-1">
      <div className="w-full h-[120px] sm:h-[170px] md:h-[200px] bg-gray-100 animate-shimmer rounded-2xl shadow-sm border border-white/50" />
    </div>
  );
}
