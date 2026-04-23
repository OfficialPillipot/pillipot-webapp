"use client";

import React, { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User as UserIcon, Package, Heart, LogOut, Settings } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-pp-surface">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      <main className="flex-1 pp-container py-6 md:py-12">
        <div className="mx-auto max-w-3xl bg-white/68 border border-white/60 p-6 md:p-10 rounded-[2rem] pp-shadow">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 border-b border-slate-100 pb-10 text-center md:text-left">
            <div className="w-24 h-24 bg-pp-primary/10 rounded-[2rem] flex items-center justify-center border border-pp-primary/20 text-pp-primary shadow-sm shrink-0">
              <UserIcon className="w-10 h-10" />
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">{user.name}</h1>
              <p className="text-sm font-semibold text-slate-500 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">{user.username}</p>
            </div>
            <div className="hidden md:block pt-3">
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Link href="/orders" className="flex items-center gap-5 bg-white hover:bg-slate-50 border border-slate-100 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] transition-all pp-shadow hover:pp-shadow-hover group">
              <div className="w-14 h-14 rounded-[1.2rem] bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Orders</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Track, return, or buy again</p>
              </div>
            </Link>

            <Link href="/wishlist" className="flex items-center gap-5 bg-white hover:bg-slate-50 border border-slate-100 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] transition-all pp-shadow hover:pp-shadow-hover group">
              <div className="w-14 h-14 rounded-[1.2rem] bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Wishlist</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Manage your saved items</p>
              </div>
            </Link>

            <button onClick={() => {}} className="flex items-center gap-5 bg-white hover:bg-slate-50 border border-slate-100 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] transition-all pp-shadow hover:pp-shadow-hover group text-left cursor-not-allowed opacity-70">
              <div className="w-14 h-14 rounded-[1.2rem] bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Settings</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Manage details (Coming soon)</p>
              </div>
            </button>
            
            <button
              onClick={logout}
              className="flex md:hidden items-center gap-5 bg-white hover:bg-red-50 border border-slate-100 p-5 rounded-2xl transition-all pp-shadow hover:border-red-100 group text-left"
            >
              <div className="w-14 h-14 rounded-[1.2rem] bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogOut className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-600 tracking-tight">Log Out</h3>
                <p className="text-xs font-semibold text-red-400 mt-1">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
