"use client";

import Link from "next/link";
import Image from "next/image";
import { LuStar, LuHeart, LuShoppingCart } from "react-icons/lu";
import { Product } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const displayImage =
    product.imageUrl ||
    `data:image/svg+xml;base64,${btoa(
      '<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#EEF4FF"/><circle cx="200" cy="170" r="68" stroke="#C7D4EF" stroke-width="2" stroke-dasharray="6 6"/><path d="M200 138V202M168 170H232" stroke="#9CB2DA" stroke-width="3" stroke-linecap="round"/><text x="200" y="286" text-anchor="middle" fill="#6E86B7" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="0.08em">COMING SOON</text></svg>'
    )}`;

  const rating = product.rating || 0;
  const reviewsCount = product.reviewsCount ?? 0;
  const discount = product.discount ?? 0;
  const originalPrice = product.originalPrice || 0;
  const hasDiscount = originalPrice > product.price;
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-white/55 bg-white pp-shadow transition-all duration-300 ${isOutOfStock
        ? "opacity-70 grayscale-[0.06]"
        : "hover:-translate-y-1 hover:border-pp-cyan/30 hover:pp-shadow-hover"
        }`}
    >
      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className={`absolute right-1.5 top-1.5 sm:right-3 sm:top-3 z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border bg-white/90 shadow-sm transition-all duration-200 ${wishlisted
          ? "border-red-100 bg-red-50 text-pp-accent"
          : "border-slate-200 text-slate-300 hover:border-red-100 hover:bg-red-50 hover:text-pp-accent"
          }`}
        aria-label="Toggle wishlist"
      >
        <LuHeart className={`h-3 w-3 sm:h-4 sm:w-4 ${wishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Image area */}
      <Link
        href={`/product/${product.id}`}
        className="relative block"
      >
        <div className="relative">
          {/* Combined Badge Column (Tags + Discount) */}
          <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 z-10 flex flex-col items-start gap-1">
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-col gap-1">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[8px] sm:text-[10px] inline-flex items-center rounded-full bg-red-500 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-white font-black uppercase tracking-wider shadow-md relative"
                  >
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full border border-red-500"></span>
                    <span className="ml-1.5 sm:ml-2.5">{t}</span>
                  </span>
                ))}
              </div>
            )}

            {product.brand ? (
              <span className="pp-badge-brand text-[8px] sm:text-[9px] font-bold shadow-sm">{product.brand}</span>
            ) : null}
          </div>

          {/* Product image */}
          <div className="block aspect-[4/3] w-full overflow-hidden rounded-t-xl sm:rounded-t-2xl bg-pp-surface">
            <Image
              src={displayImage}
              alt={product.name}
              className="h-full w-full object-cover"
              width={300}
              height={225}
            />
          </div>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
            <span className="rounded-lg bg-slate-800 px-2 py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-white">
              Out of stock
            </span>
          </div>
        ) : null}
      </Link>

      {/* Info area */}
      <Link
        href={`/product/${product.id}`}
        className="flex flex-1 flex-col gap-1.5 p-2 sm:p-3"
      >
        {/* Product name */}
        <h3 className="flex items-center flex-wrap gap-1 text-[0.75rem] sm:text-[0.88rem] font-bold leading-tight text-slate-800 group-hover:text-pp-primary">
          <span className="line-clamp-1">{product.name}</span>
          {hasDiscount && (
            <span className="pp-badge-discount px-1 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-sm">
              {discount}% off
            </span>
          )}
        </h3>

        {/* Price row */}
        <div className="mt-auto flex flex-col gap-0.5 pt-1">
          {hasDiscount && (
            <div className="flex items-center gap-1 opacity-80">
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider">Actual Price:</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through decoration-pp-accent/30">{formatPrice(originalPrice)}</span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            {hasDiscount && <span className="text-[8px] sm:text-[9px] font-black text-pp-primary uppercase tracking-wider">Our Price:</span>}
            <span className="text-sm sm:text-base font-black text-slate-900">{formatPrice(product.price)}</span>
          </div>
        </div>

        {/* CTA hint */}
        <div className="mt-1 hidden sm:flex items-center gap-1.5 rounded-lg border border-pp-cyan/20 bg-pp-surface-alt px-2.5 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <LuShoppingCart className="h-3 w-3 text-pp-primary" />
          <span className="text-[10px] font-bold text-pp-primary">View product</span>
        </div>
      </Link>
    </div>
  );
}
