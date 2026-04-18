"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Search, ChevronRight, Package, CheckCircle2, XCircle, Truck } from "lucide-react";
import { PRODUCTS } from "@/data/products";

const MOCK_ORDERS = [
  {
    orderId: "PP1234567130",
    status: "Delivered",
    date: "Dec 12, 2025",
    items: [PRODUCTS[0]],
  },
  {
    orderId: "PP9876543510",
    status: "Cancelled",
    date: "Jan 05, 2026",
    items: [PRODUCTS[3]],
  },
  {
    orderId: "PP1122334455",
    status: "On the way",
    date: "Apr 15, 2026",
    expected: "Apr 22, 2026",
    items: [PRODUCTS[5], PRODUCTS[8]],
  },
];

export default function OrdersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1 pp-container px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters */}
          <div className="hidden md:flex flex-col w-56 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 pp-shadow p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Filters</h2>
              <div className="space-y-5">
                <FilterSection title="Status" items={["On the way", "Delivered", "Cancelled", "Returned"]} />
                <FilterSection title="Time" items={["Last 30 days", "2025", "2024"]} />
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex bg-white rounded-xl border border-gray-100 pp-shadow overflow-hidden">
              <input
                type="text"
                placeholder="Search your orders..."
                className="flex-1 px-5 py-3 outline-none text-sm"
              />
              <button className="pp-gradient text-white px-6 font-semibold flex items-center gap-2 text-sm">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {MOCK_ORDERS.map((order) => (
              <div key={order.orderId} className="bg-white rounded-2xl border border-gray-100 pp-shadow hover:pp-shadow-hover transition-shadow p-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 flex-1">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-gray-400">{item.brand}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-1 sm:min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={order.status} />
                      <span className="text-sm font-bold text-gray-900">{order.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.status === "Delivered"
                        ? `Delivered on ${order.date}`
                        : order.status === "Cancelled"
                        ? "Cancelled at your request"
                        : `Expected by ${order.expected}`}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FilterSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 accent-pp-primary" />
          {item}
        </label>
      ))}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "Delivered") return <CheckCircle2 className="w-4 h-4 text-pp-success" />;
  if (status === "Cancelled") return <XCircle className="w-4 h-4 text-pp-accent" />;
  return <Truck className="w-4 h-4 text-pp-primary" />;
}
