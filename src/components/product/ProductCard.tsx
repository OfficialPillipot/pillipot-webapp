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
  const originalPrice = product.originalPrice ?? product.price * 1.1;
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/55 bg-white pp-shadow transition-all duration-300 ${
        isOutOfStock
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
        className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition-all duration-200 ${
          wishlisted
            ? "border-red-100 bg-red-50 text-pp-accent"
            : "border-slate-200 text-slate-300 hover:border-red-100 hover:bg-red-50 hover:text-pp-accent"
        }`}
        aria-label="Toggle wishlist"
      >
        <LuHeart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Image area */}
      <Link
        href={isOutOfStock ? "#" : `/product/${product.id}`}
        className="relative block"
      >
        <div className="relative">
          {/* Tag in the top-left corner */}
          {product.tags && product.tags.length > 0 && (
            <div className="absolute top-2 left-2">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-white font-semibold shadow-md relative"
                >
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full border border-red-500"></span>
                  <span className="ml-3">{t}</span>
                </span>
              ))}
            </div>
          )}

          {/* Product image */}
          <Link href={`/product/${product.id}`} className="block aspect-[4/3] w-full overflow-hidden rounded-lg bg-pp-surface">
            <Image
              src={displayImage}
              alt={product.name}
              className="h-full w-full object-cover"
              width={300}
              height={225}
            />
          </Link>
        </div>

        {/* Badges row */}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {discount > 0 ? (
            <span className="pp-badge-discount">{discount}% off</span>
          ) : null}
          {product.brand ? (
            <span className="pp-badge-brand">{product.brand}</span>
          ) : null}
        </div>

        {/* Rating */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 shadow-sm">
          <LuStar className="h-3 w-3 fill-pp-yellow text-pp-yellow" />
          <span className="text-[11px] font-bold text-slate-800">
            {rating.toFixed(1)}
          </span>
          {reviewsCount > 0 ? (
            <span className="text-[11px] text-slate-400">({reviewsCount})</span>
          ) : null}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
            <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              Out of stock
            </span>
          </div>
        ) : null}
      </Link>

      {/* Info area */}
      <Link
        href={`/product/${product.id}`}
        className="flex flex-1 flex-col gap-2 p-3"
      >
        {/* Product name */}
        <h3 className="line-clamp-2 text-[0.88rem] font-semibold leading-[1.45] text-slate-800 group-hover:text-pp-primary">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2">
          <span className="pp-price-main">{formatPrice(product.price)}</span>
          {discount > 0 ? (
            <>
              <span className="pp-price-strike">
                {formatPrice(originalPrice)}
              </span>
              <span className="pp-price-save">Save {discount}%</span>
            </>
          ) : null}
        </div>

        {/* CTA hint */}
        <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-pp-cyan/20 bg-pp-surface-alt px-3 py-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <LuShoppingCart className="h-3.5 w-3.5 text-pp-primary" />
          <span className="text-[11px] font-bold text-pp-primary">View product</span>
        </div>
      </Link>
    </div>
  );
}
