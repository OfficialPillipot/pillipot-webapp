"use client";

import React, { useState } from "react";
import Link from "next/link";
import { login as loginApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Lock, User, ArrowRight, ShoppingBag } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginApi(username, password);
      if (res) {
        login(res.accessToken, res.user);
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 xl:p-24">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-10 h-10 rounded-xl pp-gradient flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">PILLIPOT</span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 font-medium">Please enter your details to sign in to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-semibold animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-pp-primary focus:ring-4 focus:ring-pp-primary/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                  <Link href="#" className="text-xs font-bold text-pp-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:bg-white focus:border-pp-primary focus:ring-4 focus:ring-pp-primary/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-pp-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded-lg bg-gray-50 border-gray-100 text-pp-primary focus:ring-pp-primary/10 accent-pp-primary" />
              <label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer">Remember for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full pp-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Signing in..." : (
                <>
                  Sign in <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-pp-primary font-bold hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>

      {/* Right side - Branding/Visual */}
      <div className="hidden lg:flex relative pp-gradient overflow-hidden p-12 xl:p-24 flex-col justify-between">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pp-accent/20 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse" />

        <div className="relative space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Simplify Your <br />
            Shopping Experience with Pillipot.
          </h2>
          <p className="text-white/80 text-lg xl:text-xl font-medium max-w-lg">
            Join thousands of satisfied customers and discover the easiest way to shop for electronics, fashion, and home essentials.
          </p>
        </div>

        <div className="relative p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 space-y-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" className="object-cover" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-pp-accent flex items-center justify-center text-[10px] font-black text-white">
              +10k
            </div>
          </div>
          <p className="text-white text-sm font-bold">&quot;The best marketplace I&quot;ve ever used. Delivery is lightning fast!&quot;</p>
        </div>
      </div>
    </div>
  );
}
