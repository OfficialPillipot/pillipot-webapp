"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = searchParams.get("orderId");
    if (id) setOrderId(id);
  }, [searchParams]);

  return (
    <main className="flex-1 pp-container flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 pp-gradient rounded-full flex items-center justify-center mb-6 shadow-xl">
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-2">
        Order Placed! <Sparkles className="w-7 h-7 text-pp-accent-warm" />
      </h1>
      <p className="text-gray-500 text-center mb-2 max-w-md">
        Thank you for shopping with Pillipot! Your order is confirmed.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Order ID: <span className="font-mono font-bold text-gray-700">#{orderId}</span>
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Link
          href="/"
          className="flex-1 pp-gradient text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
        <Link
          href="/orders"
          className="flex-1 border border-gray-200 bg-white text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm"
        >
          View Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-14 bg-white rounded-2xl border border-gray-100 pp-shadow p-8 w-full max-w-lg">
        <h3 className="text-base font-bold text-gray-900 mb-5">What happens next?</h3>
        <div className="space-y-5">
          {[
            { n: "1", t: "Confirmation", d: "You'll receive an order confirmation email shortly." },
            { n: "2", t: "Processing", d: "Our team will prepare your items for shipment." },
            { n: "3", t: "Delivery", d: "Track your order in real-time from the orders page." },
          ].map((s) => (
            <div key={s.n} className="flex gap-4">
              <div className="w-8 h-8 rounded-full pp-gradient text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {s.n}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{s.t}</h4>
                <p className="text-sm text-gray-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-pp-primary" /></div>}>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
