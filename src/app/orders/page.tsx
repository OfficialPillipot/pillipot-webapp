"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders, cancelOrderApi } from "@/lib/api";
import { Package, Calendar, MapPin, ChevronRight, ShoppingBag, Loader2, Search, RotateCcw, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await getMyOrders(token!);
    setOrders(data);
    setIsLoading(false);
  };

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedOrderId || !token) return;
    
    setIsCancelling(true);
    const success = await cancelOrderApi(token, selectedOrderId);
    if (success) {
      await loadOrders();
      setShowCancelModal(false);
      setSelectedOrderId(null);
    }
    setIsCancelling(false);
  };

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "dispatch": return "bg-blue-100 text-blue-700";
      case "packed": return "bg-violet-100 text-violet-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1 pp-container py-8">
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex text-xs font-bold text-gray-400 gap-2 mb-2 uppercase tracking-widest">
                <span className="hover:text-pp-primary cursor-pointer" onClick={() => router.push("/")}>Your Account</span>
                <span>›</span>
                <span className="text-pp-primary">Your Orders</span>
              </nav>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Orders</h1>
            </div>
            <div className="relative group lg:w-96">
              <input
                type="text"
                placeholder="Search all orders..."
                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-5 pr-12 outline-none focus:border-pp-primary focus:ring-4 focus:ring-pp-primary/5 transition-all text-sm font-medium"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-pp-dark text-white rounded-xl flex items-center justify-center hover:bg-pp-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-8 border-b border-gray-100 text-sm font-bold overflow-x-auto no-scrollbar">
            {["Orders", "Buy Again", "Not Yet Shipped", "Cancelled"].map((tab, i) => (
              <button
                key={tab}
                className={`pb-3 whitespace-nowrap transition-colors border-b-2 ${i === 0 ? "border-pp-primary text-pp-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-pp-primary animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center pp-shadow border border-gray-50 max-w-2xl mx-auto mt-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't placed any orders yet. Start shopping to see them here!</p>
            <button
              onClick={() => router.push("/")}
              className="pp-gradient text-white px-10 py-4 rounded-2xl font-black shadow-xl"
            >
              START SHOPPING
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Amazon-style Card Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Placed</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-sm font-bold text-gray-700">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ship To</p>
                    <p className="text-sm font-bold text-pp-primary hover:underline cursor-pointer truncate max-w-[150px]" title={order.customerName || user?.name}>
                      {order.customerName || user?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Order # {order.orderId}</p>
                    <div className="flex justify-end gap-3 mt-1 underline-offset-4 decoration-pp-primary/30">
                      <button className="text-xs font-bold text-pp-primary hover:underline">Order details</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-xs font-bold text-pp-primary hover:underline">Invoice</button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${order.status.toLowerCase() === 'delivered' ? 'bg-green-500' : 'bg-pp-primary-dark shadow-[0_0_8px_rgba(79,31,191,0.4)]'}`} />
                        <h3 className="text-lg font-black text-gray-900">
                          {order.status.toLowerCase() === 'delivered' ? 'Delivered' : `Arriving soon (Status: ${order.status})`}
                        </h3>
                      </div>

                      <div className="space-y-6">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-5 group/item">
                            <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm flex items-center justify-center">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                              ) : (
                                <Package className="w-8 h-8 text-gray-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-pp-primary hover:text-pp-primary-dark hover:underline cursor-pointer mb-1 line-clamp-2 leading-snug">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500 mb-3">Quantity: <span className="font-bold text-gray-700">{item.quantity}</span></p>
                              <div className="flex flex-wrap gap-2">
                                <button className="flex items-center gap-1.5 bg-pp-accent-warm text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-sm hover:brightness-110 transition-all uppercase tracking-wider">
                                  <RotateCcw className="w-3.5 h-3.5" /> Buy it again
                                </button>
                                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black hover:bg-gray-50 transition-all uppercase tracking-wider">
                                  View Item
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-64 flex flex-col gap-3">
                      {order.status.toLowerCase() === 'pending' ? (
                        <button
                          onClick={() => handleCancelClick(order.orderId)}
                          className="w-full py-3 bg-red-500 text-white rounded-xl text-xs font-black shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-center"
                        >
                          CANCEL
                        </button>
                      ) : (
                        <button className="w-full py-3 bg-white border-2 border-gray-100 text-gray-700 rounded-xl text-xs font-black shadow-sm hover:border-pp-primary/30 transition-all uppercase tracking-widest">
                          Write a product review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Cancel Order?</h3>
              <p className="text-gray-500 font-medium">Are you sure you want to cancel this order? This action cannot be undone.</p>
            </div>
            <div className="flex border-t border-gray-100 p-4 gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "YES, CANCEL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
