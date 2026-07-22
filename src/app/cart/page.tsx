"use client";

import Header from "@/components/layout/Header";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuTrash2, LuPlus, LuMinus, LuShieldCheck, LuArrowRight, LuShoppingBag, LuPackage } from "react-icons/lu";

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

  const codDeliveryFee = cart.length > 0
    ? Math.max(0, ...cart.map((item) => {
        let charge = Number(item.codDeliveryCharge || 0);
        if (item.codDeliveryMilestones && item.codDeliveryMilestones.length > 0) {
          const sorted = [...item.codDeliveryMilestones].sort((a, b) => b.quantity - a.quantity);
          const matching = sorted.find((m) => item.cartQuantity >= m.quantity);
          if (matching) {
            charge = Number(matching.charge);
          }
        }
        return charge;
      }))
    : 0;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 py-6 md:py-12">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-100 bg-white p-8 md:p-10 text-center shadow-xl shadow-slate-200/50">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-pp-primary/30">
                <LuShoppingBag className="h-10 w-10" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl md:text-3xl font-black font-sora text-slate-900">Your cart is empty</h2>
            <p className="mx-auto mb-6 max-w-md text-xs md:text-sm leading-6 text-slate-500 font-medium">
              Looks like you haven&apos;t added anything yet. Explore our curated collections to find something special.
            </p>
            <Link
              href="/"
              className="bg-pp-primary text-white rounded-full px-8 py-3.5 text-xs md:text-sm font-bold shadow-lg shadow-pp-primary/25 hover:scale-105 active:scale-95 transition-all inline-block"
            >
              EXPLORE PRODUCTS
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9]">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-2.5 sm:px-4 py-3 md:py-8 pb-48 lg:pb-8">
        {/* Compact Cart Intro Section */}
        <section className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-6 mb-3 sm:mb-6 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-black font-sora text-slate-900">Shopping Cart ({cartCount})</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium hidden sm:block">Review quantities, savings, and delivery details before checkout.</p>
          </div>
          {cartMrpTotal > cartTotal && (
            <span className="text-[10px] sm:text-xs font-bold text-green-700 bg-green-50 border border-green-200/60 px-2.5 py-1 rounded-full shrink-0">
              Save {formatPrice(cartMrpTotal - cartTotal)}
            </span>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 items-start">
          {/* Compact Cart Items List — 3+ products visible on mobile */}
          <section className="lg:col-span-2 space-y-2.5 sm:space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center gap-3 sm:gap-5 shadow-sm border border-slate-100 transition hover:shadow-md ${
                  syncingItems[item.id] ? "opacity-70 grayscale pointer-events-none" : "opacity-100"
                }`}
              >
                {/* Product Image */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-slate-50 rounded-lg sm:rounded-xl p-1.5 relative group overflow-hidden border border-slate-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-contain p-1 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LuPackage className="h-7 w-7 text-slate-200" />
                    </div>
                  )}
                </div>
                
                {/* Product Info & Controls */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-pp-primary uppercase tracking-wider mb-0.5 truncate">{item.brand || "PILLIPOT"}</p>
                      <h3 className="text-xs sm:text-base font-bold font-sora text-slate-800 capitalize truncate">{item.name}</h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={syncingItems[item.id]}
                      className="p-1 sm:p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                      title="Remove item"
                    >
                      <LuTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  {/* Price & Quantity Row */}
                  <div className="mt-2 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-xl font-black text-slate-900">{formatPrice(item.price)}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <>
                          <span className="text-slate-400 line-through text-[10px] sm:text-xs">{formatPrice(item.originalPrice)}</span>
                          <span className="text-green-600 font-bold text-[9px] sm:text-xs bg-green-50 px-1.5 py-0.5 rounded">
                            {Math.round((1 - item.price / item.originalPrice) * 100)}% Off
                          </span>
                        </>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-full p-0.5 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        disabled={item.cartQuantity <= 1 || syncingItems[item.id]}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-slate-500 hover:text-pp-primary transition hover:bg-white rounded-full disabled:opacity-20"
                      >
                        <LuMinus className="h-3 w-3" />
                      </button>
                      <span className="px-2 sm:px-3 font-black text-slate-800 text-xs sm:text-sm min-w-[1.75rem] text-center">
                        {syncingItems[item.id] ? "..." : item.cartQuantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        disabled={item.cartQuantity >= (item.stockQuantity || 99) || syncingItems[item.id]}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-slate-500 hover:text-pp-primary transition hover:bg-white rounded-full disabled:opacity-20"
                      >
                        <LuPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Price Details Sidebar (Desktop & Mobile detail view) */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-50">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price Details</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex justify-between font-medium text-xs sm:text-sm">
                  <span className="text-slate-500">Price ({cartCount} items)</span>
                  <span className="text-slate-900">{formatPrice(cartMrpTotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-xs sm:text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-green-600">- {formatPrice(cartMrpTotal - cartTotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-xs sm:text-sm">
                  <span className="text-slate-500">Prepaid Delivery</span>
                  <span className="text-green-600 font-bold uppercase tracking-wider">Free</span>
                </div>
                {codDeliveryFee > 0 && (
                  <div className="flex justify-between font-medium text-xs sm:text-sm">
                    <span className="text-slate-500">COD Delivery</span>
                    <span className="text-slate-900">{formatPrice(codDeliveryFee)}</span>
                  </div>
                )}
                
                <div className="border-t border-dashed border-slate-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-base sm:text-xl font-black font-sora text-slate-900">Total</span>
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-black text-slate-900">{formatPrice(cartTotal)}</div>
                      {codDeliveryFee > 0 && (
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">+ {formatPrice(codDeliveryFee)} IF COD</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50/50 p-3 sm:p-4 text-center border-t border-green-100">
                <p className="text-green-700 font-bold text-xs uppercase tracking-wider">
                  🥳 You save {formatPrice(cartMrpTotal - cartTotal)} on this order
                </p>
              </div>
            </div>

            {/* Desktop Proceed Button */}
            <button
              onClick={() => {
                if (Object.values(syncingItems).some(isSyncing => isSyncing)) return;
                router.push("/checkout");
              }}
              disabled={Object.values(syncingItems).some(isSyncing => isSyncing)}
              className="hidden lg:flex w-full bg-pp-primary text-white py-4 rounded-full font-black font-sora text-base items-center justify-center gap-3 shadow-lg shadow-pp-primary/30 hover:brightness-110 active:scale-95 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:grayscale disabled:cursor-wait"
            >
              {Object.values(syncingItems).some(isSyncing => isSyncing) ? "SAVING..." : "PROCEED TO CHECKOUT"}
              <LuArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-400 px-2">
              <LuShieldCheck className="h-4 w-4 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight text-center">Safe & secure payments. 100% authentic products.</span>
            </div>
          </aside>
        </div>
      </main>

      {/* Stable / Fixed Bottom Checkout Bar on Mobile View — positioned above floating bottom nav bar */}
      <div className="fixed bottom-[86px] left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Payable</p>
            <p className="text-lg font-black text-slate-900 leading-none">{formatPrice(cartTotal)}</p>
            {cartMrpTotal > cartTotal && (
              <p className="text-[9px] font-bold text-green-600 mt-0.5">Save {formatPrice(cartMrpTotal - cartTotal)}</p>
            )}
          </div>
          <button
            onClick={() => {
              if (Object.values(syncingItems).some(isSyncing => isSyncing)) return;
              router.push("/checkout");
            }}
            disabled={Object.values(syncingItems).some(isSyncing => isSyncing)}
            className="bg-pp-primary text-white py-3 px-5 sm:px-6 rounded-full font-black font-sora text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-pp-primary/30 active:scale-95 transition-all disabled:opacity-50"
          >
            <span>{Object.values(syncingItems).some(isSyncing => isSyncing) ? "SAVING..." : "PROCEED TO CHECKOUT"}</span>
            <LuArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
