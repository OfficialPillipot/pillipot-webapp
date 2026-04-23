"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders, cancelOrderApi, downloadInvoice } from "@/lib/api";
import {
  Package, ShoppingBag, Loader2, Search, RotateCcw, AlertTriangle,
  Star, X, CheckCircle2, XCircle, Clock, Truck, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import useSWR from "swr";
import { swrKeys } from "@/lib/swrKeys";

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  sellingAmount: number;
  imageUrl?: string;
};

type Order = {
  orderId: string;
  createdAt: string;
  total: number;
  customerName?: string;
  status: string;
  trackingId?: string | null;
  items: OrderItem[];
};

// ── Tab definitions ────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",          label: "Orders",           statuses: [] },          // empty = show all
  { key: "not_shipped",  label: "Not Yet Shipped",  statuses: ["pending", "processing", "confirmed"] },
  { key: "delivered",    label: "Delivered",        statuses: ["delivered"] },
  { key: "cancelled",    label: "Cancelled",        statuses: ["cancelled"] },
  { key: "buy_again",    label: "Buy Again",        statuses: ["delivered"] }, // same data as delivered
] as const;

type TabKey = typeof TABS[number]["key"];

export default function MyOrdersPage() {
  const { token, user, loading } = useAuth();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string; imageUrl?: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const router = useRouter();

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    mutate: mutateOrders,
  } = useSWR(token ? swrKeys.myOrders(token) : null, ([, t]) => getMyOrders(t), {
    keepPreviousData: true,
  });

  useEffect(() => {
    if (loading) return;
    if (!token) router.push("/");
  }, [loading, router, token]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    const tab = TABS.find(t => t.key === activeTab)!;
    let list: Order[] = orders;

    // Filter by tab statuses (empty means "all")
    if (tab.statuses.length > 0) {
      list = list.filter(o =>
        tab.statuses.includes(o.status.toLowerCase() as never)
      );
    }

    // Filter by search query (order ID, product name, customer name)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        (o.customerName ?? "").toLowerCase().includes(q) ||
        o.items.some(item => item.productName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [orders, activeTab, searchQuery]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedOrderId || !token) return;
    setIsCancelling(true);
    const apiSuccess = await cancelOrderApi(token, selectedOrderId);
    if (apiSuccess) {
      await mutateOrders();
      setShowCancelModal(false);
      setSelectedOrderId(null);
      success("Order cancelled successfully");
    } else {
      error("Failed to cancel order");
    }
    setIsCancelling(false);
  };

  const handleReviewClick = (product: { id: string; name: string; imageUrl?: string }) => {
    setReviewingProduct(product);
    setRating(0);
    setComment("");
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !reviewingProduct || rating === 0) return;
    setIsSubmittingReview(true);
    try {
      await submitReview(token, reviewingProduct.id, rating, comment);
      setShowReviewModal(false);
      setReviewingProduct(null);
      success("Review submitted successfully!");
    } catch (err) {
      console.error(err);
      error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  // ── Tab empty-state messages ───────────────────────────────────────────────
  const emptyMessages: Record<TabKey, { title: string; sub: string }> = {
    all:         { title: "No orders yet",           sub: "Start shopping to see your orders here!" },
    not_shipped: { title: "Nothing pending",          sub: "All your orders have been shipped or delivered." },
    delivered:   { title: "No delivered orders",     sub: "We'll show your completed orders once they're delivered." },
    cancelled:   { title: "No cancelled orders",     sub: "You haven't cancelled any orders." },
    buy_again:   { title: "No past purchases",       sub: "Orders you've received will appear here to reorder." },
  };

  // ── Per-tab badge counts ───────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { all: 0, not_shipped: 0, delivered: 0, cancelled: 0, buy_again: 0 };
    const q = searchQuery.trim().toLowerCase();
    for (const tab of TABS) {
      let list = orders as Order[];
      if (tab.statuses.length > 0) {
        list = list.filter(o => tab.statuses.includes(o.status.toLowerCase() as never));
      }
      if (q) {
        list = list.filter(o =>
          o.orderId.toLowerCase().includes(q) ||
          (o.customerName ?? "").toLowerCase().includes(q) ||
          o.items.some(item => item.productName.toLowerCase().includes(q))
        );
      }
      counts[tab.key] = list.length;
    }
    return counts;
  }, [orders, searchQuery]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1 pp-container py-6 md:py-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="rounded-[1.6rem] border border-white/60 bg-white/68 p-4 pp-shadow md:min-w-[400px] md:rounded-[2rem] md:p-5">
            <nav className="mb-2 flex gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              <span className="cursor-pointer hover:text-pp-primary" onClick={() => router.push("/")}>Your Account</span>
              <span>•</span>
              <span className="text-pp-primary">Your Orders</span>
            </nav>
            <h1 className="text-2xl font-black tracking-[-0.05em] text-slate-950 md:text-3xl">Your Orders</h1>
            <p className="mt-1.5 text-sm text-slate-500">Track purchases, reorder items, and manage reviews.</p>
          </div>

          {/* Search */}
          <div className="relative lg:w-96">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or product name..."
              className="w-full rounded-full border border-white/60 bg-white/78 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-800 outline-none pp-shadow placeholder:text-slate-400 focus:border-sky-200 focus:ring-4 focus:ring-sky-100/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/60 bg-white/68 p-1.5 pp-shadow">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-pp-primary text-white shadow-lg shadow-pp-primary/25"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                    activeTab === tab.key
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search result label */}
        {searchQuery && (
          <p className="mb-4 text-sm font-semibold text-slate-500">
            {filteredOrders.length > 0
              ? `${filteredOrders.length} result${filteredOrders.length > 1 ? "s" : ""} for "${searchQuery}"`
              : `No results for "${searchQuery}"`}
          </p>
        )}

        {/* Orders list */}
        {isOrdersLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-pp-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mx-auto mt-12 max-w-lg rounded-[2rem] border border-white/60 bg-white/78 p-12 text-center pp-shadow">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="mb-2 text-xl font-black tracking-[-0.04em] text-slate-950">
              {emptyMessages[activeTab].title}
            </h2>
            <p className="mb-7 text-sm text-slate-500">{emptyMessages[activeTab].sub}</p>
            {activeTab !== "cancelled" && (
              <button
                onClick={() => router.push("/")}
                className="pp-button-primary rounded-full px-8 py-3.5 text-sm font-black"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredOrders.map((order) => {
              const statusLower = order.status.toLowerCase();
              const isDelivered = statusLower === "delivered";
              const isCancelled = statusLower === "cancelled";
              const canCancel = ["pending", "processing", "confirmed"].includes(statusLower);

              return (
                <div
                  key={order.orderId}
                  className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/88 pp-shadow transition-all hover:pp-shadow-hover"
                >
                  {/* Order meta row */}
                  <div className="grid grid-cols-2 items-center gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-4 md:grid-cols-4 md:gap-6 md:px-6">
                    <div>
                      <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Placed</p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total</p>
                      <p className="text-sm font-bold text-slate-700">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ship To</p>
                      <p className="max-w-[150px] truncate text-sm font-bold text-pp-primary" title={order.customerName || user?.name}>
                        {order.customerName || user?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Order # {order.orderId}
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => router.push(`/orders/${order.orderId}`)}
                          className="text-xs font-bold text-pp-primary underline-offset-2 hover:underline"
                        >
                          Order details
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => downloadInvoice(token!, order.orderId)}
                          className="text-xs font-bold text-pp-primary underline-offset-2 hover:underline"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order body */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
                      <div className="flex-1 space-y-5">
                        {/* Status headline */}
                        <div className="flex items-center gap-2.5">
                          {isDelivered ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          ) : isCancelled ? (
                            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                          ) : (
                            <Clock className="h-5 w-5 text-pp-primary shrink-0" />
                          )}
                          <h3 className={`text-base font-black tracking-tight ${
                            isDelivered ? "text-green-700"
                            : isCancelled ? "text-red-600"
                            : "text-slate-900"
                          }`}>
                            {isDelivered
                              ? "✓ Delivered"
                              : isCancelled
                              ? "Order Cancelled"
                              : `Arriving soon — Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`}
                          </h3>
                          {/* Status badge */}
                          <span className={`ml-auto rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                            isDelivered ? "bg-green-50 text-green-700"
                            : isCancelled ? "bg-red-50 text-red-600"
                            : "bg-[#edf4ff] text-pp-primary"
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Tracking ID banner — shown when admin has set a tracking ID */}
                        {order.trackingId && (
                          <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-[#f0f7ff] px-4 py-3">
                            <Truck className="h-4 w-4 shrink-0 text-pp-primary" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                Tracking ID
                              </p>
                              <p className="mt-0.5 text-sm font-bold text-slate-800 tracking-wider">
                                {order.trackingId}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.trackingId!);
                                success("Tracking ID copied!");
                              }}
                              className="shrink-0 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-pp-primary transition-colors hover:bg-[#edf4ff]"
                            >
                              Copy
                            </button>
                          </div>
                        )}

                        {/* Items */}
                        <div className="space-y-5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="group/item flex gap-4">
                              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] shadow-sm sm:h-24 sm:w-24">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                                  />
                                ) : (
                                  <Package className="h-8 w-8 text-slate-200" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="mb-1 line-clamp-2 cursor-pointer text-[0.875rem] font-bold leading-snug text-pp-primary hover:underline"
                                  onClick={() => router.push(`/product/${item.productId}`)}
                                >
                                  {item.productName}
                                </p>
                                <p className="mb-3 text-xs text-slate-500">
                                  Qty: <span className="font-bold text-slate-700">{item.quantity}</span>
                                  <span className="ml-3 font-bold text-slate-700">{formatPrice(item.sellingAmount)}</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {/* Buy it again — shown on "Buy Again" tab or for delivered orders */}
                                  {(activeTab === "buy_again" || isDelivered) && (
                                    <button
                                      onClick={() => {
                                        addToCart({
                                          id: item.productId,
                                          name: item.productName,
                                          price: item.sellingAmount / item.quantity,
                                          imageUrl: item.imageUrl,
                                          stockQuantity: 100,
                                        });
                                        router.push("/cart");
                                      }}
                                      className="flex items-center gap-1.5 rounded-full bg-pp-accent-warm px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition-all hover:brightness-110"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      Buy it again
                                    </button>
                                  )}
                                  <button
                                    onClick={() => router.push(`/product/${item.productId}`)}
                                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50"
                                  >
                                    View Item
                                  </button>
                                  {isDelivered && (
                                    <button
                                      onClick={() => handleReviewClick({ id: item.productId, name: item.productName, imageUrl: item.imageUrl })}
                                      className="rounded-full bg-[#edf4ff] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-pp-primary transition-all hover:bg-pp-primary hover:text-white"
                                    >
                                      Write a review
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action column */}
                      {canCancel && (
                        <div className="lg:w-56 flex flex-col gap-3">
                          <button
                            onClick={() => handleCancelClick(order.orderId)}
                            className="w-full rounded-full border border-red-200 bg-red-50 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-red-600 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
                          >
                            Cancel Order
                          </button>
                          <button
                            onClick={() => router.push(`/orders/${order.orderId}`)}
                            className="w-full rounded-full border border-slate-200 bg-white py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition-all hover:bg-slate-50"
                          >
                            Track Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Cancel Order?</h3>
              <p className="text-gray-500 font-medium text-sm">Are you sure you want to cancel this order? This action cannot be undone.</p>
            </div>
            <div className="flex border-t border-gray-100 p-4 gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3.5 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
              <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center">
                  {reviewingProduct.imageUrl ? (
                    <img src={reviewingProduct.imageUrl} alt={reviewingProduct.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-200" />
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900 line-clamp-2">{reviewingProduct.name}</p>
              </div>

              <div className="text-center space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate this product</p>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform active:scale-90"
                    >
                      <Star className={`w-9 h-9 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Feedback</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike about this product?"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-pp-primary focus:bg-white rounded-2xl p-4 outline-none transition-all text-sm font-medium min-h-[110px] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3.5 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || rating === 0}
                  className="flex-1 py-3.5 bg-pp-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pp-primary-dark transition-colors shadow-lg shadow-pp-primary/20 disabled:opacity-50"
                >
                  {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
