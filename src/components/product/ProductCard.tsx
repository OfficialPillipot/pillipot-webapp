"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart } from "lucide-react";
import { Product } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const displayImage = product.imageUrl || `data:image/svg+xml;base64,${btoa('<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#F3F4FB"/><path d="M200 150V250M150 200H250" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round"/><circle cx="200" cy="200" r="60" stroke="#D1D5DB" stroke-width="2" stroke-dasharray="4 4"/><text x="200" y="290" text-anchor="middle" fill="#9CA3AF" font-family="sans-serif" font-size="12" font-weight="600" letter-spacing="0.05em">NO IMAGE</text></svg>')}`;
  const rating = product.rating || 0;
  const reviewsCount = product.reviewsCount ?? 0;
  const discount = product.discount ?? 0;
  const originalPrice = product.originalPrice ?? (product.price * 1.1);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-white flex flex-col group cursor-pointer transition-all duration-300 h-full border border-transparent hover:border-gray-200 relative p-4">

      {/* Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full aspect-[3/4] sm:aspect-square mb-3 overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />

          {/* ⭐ Rating bottom-right */}
          <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-[#388e3c] text-white text-[10px] px-1.5 py-0.5 rounded">
            {rating}
            <Star className="w-2.5 h-2.5 fill-white" />
            {reviewsCount > 0 && (
              <span className="text-gray-200 text-[8px] border-l border-white/20 pl-1 ml-0.5">
                {reviewsCount}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className="absolute top-4 right-4 text-gray-300 hover:text-pp-accent transition-colors z-10"
      >
        <Heart
          className={`w-5 h-5 ${wishlisted ? "fill-pp-accent text-pp-accent" : ""
            }`}
        />
      </button>

      {/* Info */}
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col gap-1.5 flex-1 items-start text-left"
      >
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-pp-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-auto">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>

          {discount > 0 && (
            <>
              <span className="text-gray-400 text-xs line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-[#388e3c] text-xs font-bold">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
