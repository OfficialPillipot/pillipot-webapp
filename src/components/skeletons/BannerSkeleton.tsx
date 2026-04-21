import React from "react";

export default function BannerSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-30 pt-6 animate-pulse">
      <div className="w-full min-h-[200px] md:min-h-[280px] bg-gray-200 rounded-3xl" />
    </div>
  );
}
