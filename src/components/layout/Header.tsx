"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, ShoppingCart, User, Heart, Menu, X, Home, Package, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout, setIsLoginModalOpen } = useAuth();
  const [search, setSearch] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Sync search input with URL query param
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
    }
  };

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <>
      <header className="pp-gradient sticky top-0 z-50 shadow-lg shadow-pp-primary/10 backdrop-blur-xl bg-opacity-90">
        <div className="pp-container w-full flex items-center h-16 md:h-[72px] gap-3 lg:gap-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-white p-1"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 lg:gap-2.5 shrink-0 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center transition-all duration-300 md:group-hover:rotate-6 group-hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <span className="text-pp-primary font-black text-xl md:text-2xl" style={{ fontFamily: "var(--font-outfit)" }}>P</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-extrabold text-lg md:text-2xl tracking-tight transition-transform duration-300 group-hover:translate-x-0.5" style={{ fontFamily: "var(--font-outfit)" }}>pillipot</span>
              <span className="text-white/70 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase hidden sm:block mt-0.5">marketplace</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[560px] relative hidden md:block">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands & more..."
              className="w-full bg-white/15 backdrop-blur-sm border border-white/20 h-10 rounded-xl px-5 pr-12 text-sm outline-none text-white placeholder:text-white/50 focus:bg-white/25 focus:border-white/40 transition-all font-medium"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-105 active:scale-95">
              <Search className="text-white w-4 h-4" />
            </button>
          </form>

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden text-white p-3 ml-auto"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold shadow-lg ${
                    userMenuOpen 
                      ? "bg-white text-pp-primary scale-105" 
                      : "text-white bg-white/10 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${userMenuOpen ? "bg-pp-primary/10" : "bg-white/20"}`}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 mb-1 border-b border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Management</p>
                    </div>
                    <Link 
                      href="/orders" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-violet-50 hover:text-pp-primary transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-pp-primary group-hover:text-white transition-all">
                        <Package className="w-4 h-4" />
                      </div>
                      My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                        <LogOut className="w-4 h-4" />
                      </div>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 text-white/90 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-sm font-bold border border-white/20 active:scale-95 shadow-lg shadow-black/5"
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden lg:inline">Login</span>
              </button>
            )}

            <Link href="/wishlist" className="flex items-center gap-2 text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-medium relative">
              <Heart className="w-4 h-4" />
              <span className="hidden lg:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pp-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="flex items-center gap-2 text-white px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm font-semibold relative">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden lg:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pp-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar (expandable) */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands..."
                autoFocus
                className="w-full bg-white/15 border border-white/20 h-10 rounded-xl px-4 pr-10 text-sm outline-none text-white placeholder:text-white/50 focus:bg-white/25"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                <Search className="text-white w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Slide Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 w-72 h-full bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-left">
            <div className="pp-gradient p-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-pp-primary font-black text-xl">P</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-extrabold text-lg">pillipot</span>
                <span className="text-white/60 text-[10px] tracking-widest uppercase">marketplace</span>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {[
                { label: "Home", href: "/", icon: Home },
                { label: "My Orders", href: "/orders", icon: Package },
                { label: "My Wishlist", href: "/wishlist", icon: Heart },
                { label: "My Cart", href: "/cart", icon: ShoppingCart },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href
                    ? "bg-violet-50 text-pp-primary font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-pp-primary hover:bg-violet-50 transition-all"
                >
                  <User className="w-5 h-5" /> Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pp-shadow">
        <div className="flex items-center justify-around h-14">
          <BottomNavItem href="/" icon={Home} label="Home" active={pathname === "/"} />
          <BottomNavItem href="/wishlist" icon={Heart} label="Wishlist" active={pathname === "/wishlist"} badge={wishlistCount} />
          <BottomNavItem href="/cart" icon={ShoppingCart} label="Cart" active={pathname === "/cart"} badge={cartCount} />
          <BottomNavItem href="/orders" icon={Package} label="Orders" active={pathname === "/orders"} />
          <BottomNavItem href="/orders" icon={User} label="Account" active={false} />
        </div>
      </nav>
    </>
  );
}

function BottomNavItem({ href, icon: Icon, label, active, badge }: {
  href: string; icon: any; label: string; active: boolean; badge?: number;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 relative">
      <Icon className={`w-5 h-5 ${active ? "text-pp-primary" : "text-gray-400"}`} />
      <span className={`text-[10px] font-semibold ${active ? "text-pp-primary" : "text-gray-400"}`}>{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute -top-1 right-0 bg-pp-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
