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

  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

  return (
    <div className={`bg-white flex flex-col transition-all duration-300 h-full border border-gray-100/60 rounded-2xl relative p-3 sm:p-4 overflow-hidden ${
      isOutOfStock 
        ? "opacity-75 pointer-events-none grayscale-[0.2]" 
        : "group cursor-pointer hover:border-pp-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1"
    }`}>
      
      {/* Soft gradient background behind image for premium look */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50/50 to-transparent z-0 rounded-t-2xl pointer-events-none" />

      {/* Image */}
      <Link 
        href={isOutOfStock ? "#" : `/product/${product.id}`} 
        className="z-10 block"
        tabIndex={isOutOfStock ? -1 : 0}
      >
        <div className="relative w-full aspect-[4/5] sm:aspect-square mb-4 overflow-hidden rounded-xl bg-[#F8F9FA] flex items-center justify-center p-2 group-hover:bg-white transition-colors duration-500">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-30">
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* ⭐ Rating bottom-left instead of right for better balance */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 text-gray-800 font-bold text-[11px] px-2 py-0.5 rounded-lg z-20">
            {rating}
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {reviewsCount > 0 && (
              <span className="text-gray-400 text-[10px] font-medium border-l border-gray-200 pl-1.5 ml-0.5">
                {reviewsCount}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist button (Floating) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className={`absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 transition-all duration-300 z-20 ${wishlisted ? "scale-110" : "text-gray-300 hover:text-pp-accent hover:scale-110"}`}
      >
        <Heart
          className={`w-4 h-4 ${wishlisted ? "fill-pp-accent text-pp-accent" : ""}`}
        />
      </button>

      {/* Info */}
      <Link
        href={`/product/${product.id}`}
        className="flex flex-col gap-1.5 flex-1 items-start text-left z-10 px-1 pb-1"
      >
        {product.brand && (
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-pp-primary/80">
            {product.brand}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-pp-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-auto pt-2">
          <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
            {formatPrice(product.price)}
          </span>

          {discount > 0 && (
            <>
              <span className="text-gray-400 text-xs sm:text-sm line-through font-medium">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-pp-success text-[10px] sm:text-xs font-black uppercase tracking-wider bg-pp-success/10 px-1.5 py-0.5 rounded-md">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
