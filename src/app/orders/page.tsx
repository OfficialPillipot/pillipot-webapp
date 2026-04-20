"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders } from "@/lib/api";
import { Package, Calendar, MapPin, ChevronRight, ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

      <main className="flex-1 pp-container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl pp-gradient flex items-center justify-center text-white shadow-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Orders</h1>
              <p className="text-sm text-gray-500 font-medium">Manage and track your orders</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-pp-primary animate-spin" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center pp-shadow border border-gray-50">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't placed any orders yet. Start shopping to see them here!</p>
              <button 
                onClick={() => router.push("/")}
                className="pp-gradient text-white px-8 py-3 rounded-xl font-bold font-black shadow-lg"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-3xl pp-shadow border border-gray-50 overflow-hidden hover:border-pp-primary/30 transition-all group">
                  <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</span>
                        <span className="text-sm font-bold text-pp-primary">{order.orderId}</span>
                      </div>
                      <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                        <span className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                              <p className="text-xs text-gray-500 font-medium">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{formatPrice(item.sellingAmount)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4 text-pp-primary" />
                        <span className="text-xs font-medium truncate max-w-[250px]">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                          <span className="text-xl font-black text-gray-900">{formatPrice(order.total)}</span>
                        </div>
                        <button 
                          onClick={() => router.push(`/order-track/${order.orderId}`)}
                          className="w-10 h-10 rounded-full bg-pp-primary/10 text-pp-primary flex items-center justify-center group-hover:bg-pp-primary group-hover:text-white transition-all shadow-sm"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
