"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { getOrderDetails, downloadInvoice } from "@/lib/api";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ChevronLeft, 
  Truck,
  CreditCard,
  User,
  Calendar,
  Loader2,
  Copy,
  ExternalLink,
  Star
} from "lucide-react";
import useSWR from "swr";
import { swrKeys } from "@/lib/swrKeys";
import ReviewModal from "@/components/product/ReviewModal";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const orderId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string, orderLineId: string } | null>(null);
  const { data: order, isLoading } = useSWR(
    token && orderId ? swrKeys.orderDetails(token, orderId) : null,
    ([, t, oid]) => getOrderDetails(t, oid),
    { keepPreviousData: true }
  );

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-pp-surface">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-pp-primary animate-spin" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-pp-surface">
        <Header />
        <div className="flex-1 pp-container py-20 text-center">
          <XCircle className="w-20 h-20 text-red-100 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500 mb-8">We couldn't find the order you're looking for.</p>
          <button 
            onClick={() => router.push("/orders")}
            className="pp-gradient text-white px-10 py-4 rounded-2xl font-black shadow-xl"
          >
            BACK TO ORDERS
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return { label: "Delivered", icon: <CheckCircle2 className="w-6 h-6 text-green-500" />, color: "text-green-500" };
      case "cancelled": return { label: "Cancelled", icon: <XCircle className="w-6 h-6 text-red-500" />, color: "text-red-500" };
      case "dispatch": return { label: "Dispatched", icon: <Truck className="w-6 h-6 text-blue-500" />, color: "text-blue-500" };
      case "packed": return { label: "Packed", icon: <Package className="w-6 h-6 text-violet-500" />, color: "text-violet-500" };
      default: return { label: "Pending", icon: <Clock className="w-6 h-6 text-pp-primary" />, color: "text-pp-primary" };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1 pp-container py-8">
        <button 
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pp-primary transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Order Details</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Order #<span className="text-pp-primary">{order.orderId}</span> • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => downloadInvoice(token!, order.orderId)}
            className="flex items-center gap-2 bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-pp-primary hover:text-pp-primary transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Download Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-pp-primary" />
               <div className="flex items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-pp-surface rounded-2xl">
                      {statusInfo.icon}
                    </div>
                    <div>
                      <h2 className={`text-xl font-black ${statusInfo.color}`}>{statusInfo.label}</h2>
                      <p className="text-sm text-gray-500 font-bold">Updated on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
               </div>

               {/* Status Progress */}
               <div className="relative pt-4 pb-8 px-4">
                  <div className="absolute top-8 left-8 right-8 h-1 bg-gray-100" />
                  <div 
                    className="absolute top-8 left-8 h-1 bg-pp-primary transition-all duration-1000" 
                    style={{ width: `${(order.currentStep / (order.statusSteps.length - 1)) * 100}%` }}
                  />
                  <div className="flex justify-between relative z-10">
                    {order.statusSteps.map((step: string, idx: number) => (
                      <div key={step} className="flex flex-col items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${idx <= order.currentStep ? "bg-pp-primary border-pp-primary-light text-white" : "bg-white border-gray-50 text-gray-300"}`}>
                          {idx < order.currentStep ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${idx <= order.currentStep ? "text-pp-primary" : "text-gray-300"}`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Tracking ID — shown when admin has set one */}
            {order.trackingId && (
              <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-[#f0f7ff] p-5 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pp-primary/10">
                  <Truck className="h-5 w-5 text-pp-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Shipment Tracking ID
                  </p>
                  <p className="mt-1 text-lg font-black tracking-widest text-slate-900">
                    {order.trackingId}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Use this ID to track your package with the courier.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.trackingId!);
                  }}
                  className="flex items-center gap-2 self-start rounded-xl border border-sky-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-pp-primary transition-all hover:bg-pp-primary hover:text-white sm:self-center"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy ID
                </button>
              </div>
            )}

            {/* Items Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50">
                <h2 className="text-xl font-black text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-8 flex gap-6 items-center flex-wrap sm:flex-nowrap">
                    <div className="w-24 h-24 bg-pp-surface rounded-2xl flex items-center justify-center shrink-0 border border-gray-50">
                      <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900 mb-1 hover:text-pp-primary cursor-pointer transition-colors" onClick={() => router.push(`/product/${item.productId}`)}>{item.productName}</h3>
                      <div className="flex gap-4 text-sm font-bold text-gray-400">
                        <span>Quantity: <span className="text-gray-700">{item.quantity}</span></span>
                        <span>•</span>
                        <span>Price: <span className="text-gray-700">{formatPrice(item.sellingAmount)}</span></span>
                      </div>
                      
                      {order.status === "delivered" && (
                        <button 
                          onClick={() => setSelectedProduct({ id: item.productId, name: item.productName, orderLineId: item.id })}
                          className="mt-4 flex items-center gap-2 text-pp-primary text-xs font-black uppercase tracking-widest hover:text-pp-primary-dark transition-colors"
                        >
                          <Star className="w-4 h-4" />
                          Rate & Review Product
                        </button>
                      )}
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <p className="text-xl font-black text-pp-primary">{formatPrice(item.sellingAmount + (item.deliveryFee || 0))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Delivery Info */}
            <div className="bg-pp-dark text-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-pp-accent-warm" />
                <h2 className="text-lg font-black uppercase tracking-tighter">Shipping Address</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <User className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                  <p className="font-bold text-gray-200">{order.customerName}</p>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                  <div className="text-gray-300 text-sm font-medium leading-relaxed">
                    <p>{order.deliveryAddress}</p>
                    <p>{order.postOffice}, {order.district}</p>
                    <p>{order.state} - {order.pincode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 text-sm font-bold mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Product Subtotal</span>
                  <span className="text-gray-900">{formatPrice(order.grandTotal - order.items.reduce((s:any, i:any) => s+(i.deliveryFee||0), 0))}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="text-gray-900">{formatPrice(order.items.reduce((s:any, i:any) => s+(i.deliveryFee||0), 0))}</span>
                </div>
                <div className="h-px bg-gray-50 my-4" />
                <div className="flex justify-between text-lg font-black text-pp-primary">
                  <span>Total Amount</span>
                  <span>{formatPrice(order.grandTotal)}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Payment Method</p>
                  <p className="text-xs font-bold text-gray-700 uppercase">{order.orderType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedProduct && (
        <ReviewModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          orderId={selectedProduct.orderLineId}
        />
      )}

      <Footer />
    </div>
  );
}
