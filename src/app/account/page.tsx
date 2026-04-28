"use client";

import React, { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LuUser as UserIcon, LuPackage, LuHeart, LuLogOut, LuSettings } from "react-icons/lu";
import Link from "next/link";

export default function AccountPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [showChangePwd, setShowChangePwd] = React.useState(false);
  const [currentPwd, setCurrentPwd] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
  const [confirmPwd, setConfirmPwd] = React.useState("");
  const [changing, setChanging] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setError("Passwords do not match");
      return;
    }
    setChanging(true);
    setError("");
    setSuccess("");
    try {
      const res = await changePasswordApi(token!, currentPwd, newPwd);
      if (res.success) {
        setSuccess("Password changed successfully");
        setTimeout(() => setShowChangePwd(false), 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setChanging(false);
    }
  };

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
        <div className="mx-auto max-w-3xl bg-white border border-slate-100 p-6 md:p-10 rounded-[2rem] pp-shadow">
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
                <LuLogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Link href="/orders" className="flex items-center gap-5 bg-white hover:bg-slate-50 border border-slate-100 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] transition-all pp-shadow hover:pp-shadow-hover group">
              <div className="w-14 h-14 rounded-[1.2rem] bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LuPackage className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Orders</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Track, return, or buy again</p>
              </div>
            </Link>

            <Link href="/wishlist" className="flex items-center gap-5 bg-white hover:bg-slate-50 border border-slate-100 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] transition-all pp-shadow hover:pp-shadow-hover group">
              <div className="w-14 h-14 rounded-[1.2rem] bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LuHeart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Wishlist</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Manage your saved items</p>
              </div>
            </Link>

            <button 
              onClick={() => setShowChangePwd(true)} 
              className="flex items-center gap-5 bg-white hover:bg-slate-50 border border-slate-100 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] transition-all pp-shadow hover:pp-shadow-hover group text-left"
            >
              <div className="w-14 h-14 rounded-[1.2rem] bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LuSettings className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Change Password</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Update your account security</p>
              </div>
            </button>
            
            <button
              onClick={logout}
              className="flex md:hidden items-center gap-5 bg-white hover:bg-red-50 border border-slate-100 p-5 rounded-2xl transition-all pp-shadow hover:border-red-100 group text-left"
            >
              <div className="w-14 h-14 rounded-[1.2rem] bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LuLogOut className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-600 tracking-tight">Log Out</h3>
                <p className="text-xs font-semibold text-red-400 mt-1">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePwd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 pp-shadow-lg scale-in-center animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Change Password</h2>
                <button 
                  onClick={() => setShowChangePwd(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-semibold animate-shake">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-green-600 text-sm font-semibold">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-pp-primary transition-all font-medium"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-pp-primary transition-all font-medium"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-pp-primary transition-all font-medium"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changing}
                  className="w-full pp-gradient text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100"
                >
                  {changing ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
