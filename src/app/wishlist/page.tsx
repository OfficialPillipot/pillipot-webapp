"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { LuHeart, LuTrash2, LuStar } from "react-icons/lu";

export default function WishlistPage() {
  const { wishlist, removeItem } = useWishlist();
  const { addToCart } = useCart();
  const [movingItems, setMovingItems] = useState<Record<string, boolean>>({});

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  const handleMoveToCart = async (product: Product) => {
    setMovingItems(prev => ({ ...prev, [product.id]: true }));
    try {
      await addToCart(product);
      await removeItem(product.id);
    } finally {
      setMovingItems(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-pp-surface">
        <Header />
        <main className="flex-1 pp-container flex flex-col items-center justify-center py-20 px-4">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
            <LuHeart className="h-12 w-12 text-pp-accent/40" />
          </div>
          <h2 className="mb-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Your wishlist is empty</h2>

          <Link
            href="/"
            className="pp-button-primary rounded-full px-10 py-3 text-sm font-bold"
          >
            EXPLORE PRODUCTS
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="pp-container flex-1 py-6 md:py-8">
        <div className="mb-6 rounded-[1.6rem] border border-white/60 bg-white/68 p-4 pp-shadow md:mb-8 md:rounded-[2rem] md:p-5">
          <h1 className="text-2xl font-black tracking-[-0.05em] text-slate-950 md:text-3xl">
            My Wishlist <span className="ml-2 text-base font-medium text-slate-500 md:text-lg">{wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">Save favorites, compare them later, and move them straight into the cart.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-[1.8rem] border border-white/60 bg-white/82 pp-shadow transition-all duration-300 hover:-translate-y-1 hover:pp-shadow-hover"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-slate-400 shadow-lg transition-all active:scale-90 hover:bg-white hover:text-red-500"
              >
                <LuTrash2 className="w-4 h-4" />
              </button>

              <Link href={`/product/${item.id}`} className="block">
                <div className="relative aspect-square w-full overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4">
                  <Image
                    src={item.imageUrl || ""}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-3 transition-transform duration-500 hover:scale-105"
                  />
                  {(item.discount ?? 0) > 0 && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-pp-accent shadow-sm">
                      {item.discount}% OFF
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-3 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="truncate text-sm font-black text-slate-900 line-clamp-1">{item.brand || "PILLIPOT"}</h3>
                  <p className="mt-0.5 truncate text-sm text-slate-500 line-clamp-2">{item.name}</p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-950">{formatPrice(item.price)}</span>
                    {(item.discount ?? 0) > 0 && item.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(item.originalPrice)}</span>
                    )}
                    {(item.discount ?? 0) > 0 && (
                      <span className="text-[10px] text-pp-accent font-bold">({item.discount}% OFF)</span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 opacity-80">
                  <div className="flex items-center gap-0.5 rounded-full bg-pp-success px-2 py-1 text-[9px] font-bold text-white">
                    {item.rating ?? 4.5} <LuStar className="w-2 h-2 fill-white" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleMoveToCart(item)}
                disabled={movingItems[item.id]}
                className="w-full border-t border-slate-100 bg-white py-3 text-[11px] font-black uppercase tracking-[0.2em] text-pp-primary transition-all duration-300 hover:bg-[#edf4ff] disabled:cursor-wait disabled:opacity-50"
              >
                {movingItems[item.id] ? "MOVING..." : "MOVE TO BAG"}
              </button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
