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
  const rating = product.rating ?? 4.5;
  const reviews = product.reviews ?? 100;
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
    <div className="bg-white rounded-3xl p-5 flex flex-col group cursor-pointer hover:pp-shadow-hover hover:scale-[1.03] transition-all duration-300 h-full border border-gray-100 relative">
      {/* Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full aspect-square mb-5 overflow-hidden rounded-2xl bg-gray-50">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-pp-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {discount}% OFF
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
        className={`absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md z-10 ${
          wishlisted
            ? "bg-pp-accent text-white scale-110"
            : "bg-white/90 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110"
        }`}
      >
        <Heart className={`w-5 h-5 ${wishlisted ? "fill-white" : ""}`} />
      </button>

      {/* Info */}
      <Link href={`/product/${product.id}`} className="flex flex-col gap-2 flex-1">
        <p className="text-xs text-pp-primary font-bold uppercase tracking-widest">{product.brand || "Pillipot"}</p>
        <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-auto">
          <div className="bg-pp-success text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            {rating} <Star className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-gray-400 text-xs">({reviews.toLocaleString()} reviews)</span>
        </div>

        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-xl font-black text-gray-900">{formatPrice(product.price)}</span>
          {discount > 0 && (
            <span className="text-gray-400 text-sm line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
