"use client";

import React, { useState } from "react";
import Link from "next/link";
import { register as registerApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Lock, User, Mail, Phone, ArrowRight, ShoppingBag } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await registerApi(formData);
      if (res) {
        login(res.accessToken, res.user);
      } else {
        setError("Registration failed. Email or phone might already be in use.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Visual Side */}
      <div className="hidden lg:flex relative pp-gradient overflow-hidden p-12 xl:p-24 flex-col justify-between">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        
        <div className="relative space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Start Your Journey <br />
            with Pillipot Today.
          </h2>
          <p className="text-white/80 text-lg xl:text-xl font-medium max-w-lg">
            Create an account to track orders, save wishlists, and get specialized offers tailored for you.
          </p>
        </div>

        <div className="relative p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pp-success/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-pp-success" />
            </div>
            <div>
              <p className="text-white font-bold">Safe & Secure</p>
              <p className="text-white/60 text-xs font-medium">Your data is always protected.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 lg:p-12 xl:p-24 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-10">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-10 h-10 rounded-xl pp-gradient flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">PILLIPOT</span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-500 font-medium">Join us for a better shopping experience.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <InputField icon={User} label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
              <InputField icon={Mail} label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              <InputField icon={Phone} label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Password"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-10 pr-4 outline-none focus:bg-white focus:border-pp-primary transition-all text-sm"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirm"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-10 pr-4 outline-none focus:bg-white focus:border-pp-primary transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-pp-primary hover:underline"
              >
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full pp-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100 overflow-hidden"
            >
              {loading ? "Creating account..." : (
                <>
                  Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-pp-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, name, type = "text", value, onChange, required }: any) {
  return (
    <div className="space-y-1.5">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={label}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:border-pp-primary focus:ring-4 focus:ring-pp-primary/5 transition-all text-sm"
        />
      </div>
    </div>
  );
}
