"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeItem } = useWishlist();
  const { addToCart } = useCart();
  const [movingItems, setMovingItems] = useState<Record<string, boolean>>({});

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  const handleMoveToCart = async (product: any) => {
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
          <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-pp-accent/40" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 text-center max-w-xs">
            Save items you love to your wishlist. Review them anytime and easily move them to the cart.
          </p>
          <Link
            href="/"
            className="pp-gradient text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
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

      <main className="flex-1 pp-container py-10">
        <div className="mb-10">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            My Wishlist <span className="font-normal text-gray-500 ml-1">{wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 relative group flex flex-col overflow-hidden"
            >
              {/* Close/Remove Icon */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white shadow-lg border border-gray-100 transition-all active:scale-90"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Image Container */}
              <Link href={`/product/${item.id}`} className="block">
                <div className="relative w-full aspect-square bg-white overflow-hidden p-4">
                  <Image
                    src={item.imageUrl || ""}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-2 hover:scale-110 transition-transform duration-500"
                  />
                  {(item.discount ?? 0) > 0 && (
                    <div className="absolute bottom-3 left-0 bg-white/90 backdrop-blur-sm text-pp-accent text-[10px] font-bold px-2 py-1 shadow-sm">
                      {item.discount}% OFF
                    </div>
                  )}
                </div>
              </Link>

              {/* Info Container */}
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-1 truncate">{item.brand || "PILLIPOT"}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 truncate">{item.name}</p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                    {(item.discount ?? 0) > 0 && item.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                    )}
                    {(item.discount ?? 0) > 0 && (
                      <span className="text-[10px] text-pp-accent font-bold">({item.discount}% OFF)</span>
                    )}
                  </div>
                </div>

                {/* Stars/Rating - Optional small version */}
                <div className="mt-2 flex items-center gap-1 opacity-80">
                  <div className="bg-pp-success text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                    {item.rating ?? 4.5} <Star className="w-2 h-2 fill-white" />
                  </div>
                </div>
              </div>

              {/* Full Width Button at Bottom */}
              <button
                onClick={() => handleMoveToCart(item)}
                disabled={movingItems[item.id]}
                className="w-full bg-white border-t border-gray-100 py-3 text-[11px] font-bold text-pp-primary uppercase tracking-widest hover:bg-pp-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
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
