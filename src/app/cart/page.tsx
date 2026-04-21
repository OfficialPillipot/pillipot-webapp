"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShieldCheck, ArrowRight, ShoppingBag, Package } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal, cartMrpTotal, cartCount, syncingItems } = useCart();

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-pp-surface">
        <Header />
        <main className="flex-1 pp-container flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-violet-50 flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-pp-primary/40" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-center max-w-xs">
            Looks like you haven&apos;t added anything yet. Start exploring!
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

      <main className="flex-1 pp-container px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cartCount})</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cart Items */}
          <div className="flex-1 w-full flex flex-col gap-3">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 pp-shadow hover:pp-shadow-hover transition-all ${
                  syncingItems[item.id] ? "opacity-70 pointer-events-none sm:pointer-events-auto" : "opacity-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  {/* Quantity */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        disabled={item.cartQuantity <= 1 || syncingItems[item.id]}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">
                        {syncingItems[item.id] ? "..." : item.cartQuantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        disabled={item.cartQuantity >= (item.stockQuantity || 99) || syncingItems[item.id]}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {item.stockQuantity && item.stockQuantity < 10 && (
                      <span className="text-[10px] font-bold text-pp-accent">Only {item.stockQuantity} left</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-[10px] text-pp-primary font-bold uppercase tracking-wider">{item.brand}</p>
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                    {(item.discount ?? 0) > 0 && item.originalPrice && (
                      <>
                        <span className="text-gray-400 line-through text-xs">{formatPrice(item.originalPrice)}</span>
                        <span className="text-pp-success font-bold text-xs">{item.discount}% Off</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Free delivery by Mon, Apr 22</p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  disabled={syncingItems[item.id]}
                  className="self-start text-gray-400 hover:text-pp-accent transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Price Details */}
          <div className="lg:w-[350px] w-full sticky top-20">
            <div className="bg-white rounded-2xl border border-gray-100 pp-shadow overflow-hidden">
              <h2 className="text-xs font-bold text-gray-400 tracking-widest p-5 border-b border-gray-100 uppercase">Price Details</h2>
              <div className="p-5 space-y-4">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Price ({cartCount} item{cartCount > 1 ? 's' : ''})</span>
                  <span>{formatPrice(cartMrpTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Discount</span>
                  <span className="text-pp-success font-semibold">- {formatPrice(cartMrpTotal - cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Delivery</span>
                  <span className="text-pp-success font-semibold uppercase">Free</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <div className="p-4 bg-green-50/50 border-t border-gray-100">
                <p className="text-pp-success font-semibold text-xs text-center">
                  🎉 You save {formatPrice(cartMrpTotal - cartTotal)} on this order
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (Object.values(syncingItems).some(isSyncing => isSyncing)) return;
                router.push("/checkout");
              }}
              disabled={Object.values(syncingItems).some(isSyncing => isSyncing)}
              className="mt-4 w-full pp-gradient text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-wait"
            >
              {Object.values(syncingItems).some(isSyncing => isSyncing) ? "SAVING CHANGES..." : "PROCEED TO CHECKOUT"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 flex items-center gap-2 text-gray-400 text-[11px]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>Safe & secure payments. 100% authentic products.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
