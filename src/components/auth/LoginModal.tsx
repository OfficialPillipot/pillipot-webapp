"use client";

import React, { useState, useEffect } from "react";
import { LuX, LuMail, LuLock, LuLoaderCircle, LuArrowRight, LuCircleAlert, LuUser as UserIcon, LuPhone } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import { forgotPassword, login as loginApi, register as registerApi, googleAuth } from "@/lib/api";

export default function AuthModal() {
  const { 
    isLoginModalOpen, setIsLoginModalOpen, 
    isRegisterModalOpen, setIsRegisterModalOpen,
    login 
  } = useAuth();
  
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Synchronize internal view state with global modal state
  useEffect(() => {
    if (isLoginModalOpen) setView("login");
    if (isRegisterModalOpen) setView("register");
  }, [isLoginModalOpen, isRegisterModalOpen]);

  // Load Google Identity Services script
  useEffect(() => {
    const scriptId = "google-gsi-client";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isLoginModalOpen && !isRegisterModalOpen) return null;

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    setError(null);
    setSuccess(null);
    setView("login");
  };

  const handleSwitch = () => {
    setError(null);
    setSuccess(null);
    if (view === "login" || view === "forgot") {
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(true);
    } else {
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await loginApi(email, password);
      if (result) {
        login(result.accessToken, result.user);
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Backend expects email and phoneNumber
      const result = await registerApi({ 
        name, 
        email, 
        phoneNumber, 
        password 
      });
      if (result) {
        login(result.accessToken, result.user);
      } else {
        setError("Registration failed. Email or phone might already be in use.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await forgotPassword(email);
      if (res.debug?.userFound === false) {
        setError("No customer account found for that email/username.");
        return;
      }
      const temp = res.debug?.temporaryPassword;
      const mailHint =
        res.debug?.outboundReady === false
          ? " (Mail is not configured in API; use the temporary password below.)"
          : "";
      setSuccess(
        temp
          ? `${res.message}${mailHint}\nTemporary password: ${temp}`
          : res.message,
      );
      setPassword("");
      setTimeout(() => setView("login"), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setSuccess(null);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google Client ID is not configured yet. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file to enable Google sign-in."
      );
      return;
    }

    if (typeof window === "undefined" || !(window as any).google?.accounts) {
      setError("Google authentication service is loading. Please try again in a moment.");
      return;
    }

    try {
      setGoogleLoading(true);
      const google = (window as any).google;

      // Prefer OAuth2 Token Client for standard pop-up account picker
      if (google.accounts.oauth2) {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setGoogleLoading(false);
              setError("Google sign in was cancelled or failed.");
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const res = await googleAuth({ token: tokenResponse.access_token });
                if (res?.accessToken) {
                  login(res.accessToken, res.user);
                  handleClose();
                } else {
                  setError("Failed to sign in with Google.");
                }
              } catch (err: any) {
                setError(err.message || "Failed to authenticate with Google.");
              } finally {
                setGoogleLoading(false);
              }
            } else {
              setGoogleLoading(false);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
      } else if (google.accounts.id) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                const res = await googleAuth({ credential: response.credential });
                if (res?.accessToken) {
                  login(res.accessToken, res.user);
                  handleClose();
                } else {
                  setError("Failed to sign in with Google.");
                }
              } catch (err: any) {
                setError(err.message || "Failed to authenticate with Google.");
              } finally {
                setGoogleLoading(false);
              }
            } else {
              setGoogleLoading(false);
            }
          },
        });
        google.accounts.id.prompt();
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setError(err.message || "An error occurred with Google Sign-in.");
    }
  };

  const isLoginView = view === "login";
  const isRegisterView = view === "register";
  const isForgotView = view === "forgot";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <LuX className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pp-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {isRegisterView ? <UserIcon className="w-8 h-8 text-pp-primary" /> : <LuLock className="w-8 h-8 text-pp-primary" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoginView ? "Sign in to continue" : isForgotView ? "Reset Password" : "Create an account"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isLoginView
                ? "Sign in to your account to add items to your cart and checkout."
                : isForgotView
                  ? "Enter your email or username to receive a temporary password."
                  : "Join Pillipot to start shopping and tracking your orders."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
              <LuCircleAlert className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm animate-in fade-in slide-in-from-top-2 whitespace-pre-line">
              <p>{success}</p>
            </div>
          )}

          {!isForgotView && (
            <div className="mb-6 space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/90 rounded-2xl font-bold text-sm text-slate-700 shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {googleLoading ? (
                  <LuLoaderCircle className="w-5 h-5 animate-spin text-pp-primary" />
                ) : (
                  <FcGoogle className="w-5 h-5" />
                )}
                <span>
                  {googleLoading
                    ? "Connecting to Google..."
                    : isRegisterView
                      ? "Sign up with Google"
                      : "Continue with Google"}
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                  or continue with email
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>
            </div>
          )}

          <form
            onSubmit={isLoginView ? handleLogin : isForgotView ? handleForgotPassword : handleRegister}
            className="space-y-4"
          >
            {isRegisterView && (
              <>
                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pp-primary/20 focus:border-pp-primary focus:bg-white transition-all text-sm"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                      <LuPhone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pp-primary/20 focus:border-pp-primary focus:bg-white transition-all text-sm"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email / Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                  <LuMail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pp-primary/20 focus:border-pp-primary focus:bg-white transition-all text-sm"
                  placeholder="Enter your email or username"
                  required
                />
              </div>
            </div>

            {!isForgotView && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                  {isLoginView && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccess(null);
                        setView("forgot");
                      }}
                      className="text-xs font-bold text-pp-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                    <LuLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pp-primary/20 focus:border-pp-primary focus:bg-white transition-all text-sm"
                    placeholder={isLoginView ? "Enter your password" : "Create a password"}
                    required
                  />
                </div>
              </div>
            )}

            {isRegisterView && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pp-primary transition-colors">
                    <LuLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pp-primary/20 focus:border-pp-primary focus:bg-white transition-all text-sm"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pp-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pp-primary-dark shadow-lg shadow-pp-primary/20 hover:shadow-xl hover:shadow-pp-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-4 h-14 translate-y-2 mb-2"
            >
              {loading ? (
                <LuLoaderCircle className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLoginView ? "Sign in" : isForgotView ? "Send temporary password" : "Create Account"}{" "}
                  <LuArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            {isForgotView ? (
              <button
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setView("login");
                }}
                className="text-pp-primary font-bold hover:underline"
              >
                Back to sign in
              </button>
            ) : (
              <>
                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={handleSwitch}
                  className="text-pp-primary font-bold hover:underline"
                >
                  {isLoginView ? "Sign up for free" : "Sign in here"}
                </button>
              </>
            )}
          </p>
        </div>

        {/* Brand Bar */}
        <div className="bg-pp-primary/5 py-4 px-8 text-center border-t border-pp-primary/10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pp-primary/40">Pillipot Marketplace</span>
        </div>
      </div>
    </div>
  );
}
