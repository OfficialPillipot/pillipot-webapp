"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, User, Heart, Menu, X, Home, Package, ChevronDown, Grid2x2, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const mobileNav = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Orders", href: "/orders", icon: Package },
  { label: "My Wishlist", href: "/wishlist", icon: Heart },
  { label: "My Cart", href: "/cart", icon: ShoppingCart },
];

function HeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout, setIsLoginModalOpen } = useAuth();
  const [search, setSearch] = React.useState(initialQuery);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/65 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-14 pp-gradient opacity-95 md:h-16" />
        <div className="absolute inset-x-0 top-0 h-14 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_24%),linear-gradient(180deg,rgba(8,17,32,0.05),transparent)] md:h-16" />

        <div className="pp-container relative flex min-h-14 items-center gap-1.5 py-1 min-[360px]:gap-2">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg shadow-black/10 min-[360px]:h-9 min-[360px]:w-9"
            aria-label="Open menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/25 bg-white/90 shadow-[0_20px_50px_rgba(10,25,60,0.22)] transition-transform duration-300 group-hover:-translate-y-0.5 min-[360px]:h-9 min-[360px]:w-9">
              <span className="bg-gradient-to-br from-pp-primary via-sky-500 to-pp-accent bg-clip-text text-base font-black text-transparent min-[360px]:text-lg">
                P
              </span>
            </div>
            <div className="min-w-0 leading-none text-white">
              <div className="flex items-center gap-2">
                <span className="max-w-[120px] truncate text-[0.92rem] font-black tracking-[-0.04em] min-[360px]:max-w-[140px] min-[380px]:max-w-[180px] min-[380px]:text-base md:max-w-none md:text-[1.15rem]">
                  pillipot
                </span>
              </div>
              <span className="mt-0.5 hidden max-w-[180px] truncate text-[7px] font-semibold uppercase tracking-[0.26em] text-white/68 min-[380px]:block min-[380px]:max-w-[220px] min-[380px]:text-[8px] md:max-w-none md:text-[9px] md:tracking-[0.32em]">
                Marketplace Reimagined
              </span>
            </div>
          </Link>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <form onSubmit={handleSearch} className="relative w-[min(40vw,560px)] min-w-[248px]">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/58">
                <Search className="h-4 w-4" />
              </div>
              <input
                key={`desktop-${pathname}-${initialQuery}`}
                type="text"
                defaultValue={initialQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="h-10 w-full rounded-full border border-white/14 bg-white/12 pl-11 pr-26 text-sm font-medium text-white outline-none placeholder:text-white/52 focus:border-white/38 focus:bg-white/18"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 inline-flex h-8 min-w-[92px] items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#123468] shadow-lg shadow-black/10 hover:-translate-y-0.5"
              >
                Search
              </button>
            </form>

            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className={`flex h-10 min-w-[148px] items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-bold shadow-lg ${userMenuOpen
                      ? "border-white/16 bg-white text-[#123468]"
                      : "border-white/16 bg-white/10 text-white"
                    }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/16">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="max-w-28 truncate">{user.name}</span>
                  <ChevronDown className={`h-3.5 w-3.5 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 rounded-[1.4rem] border border-slate-200/80 bg-white p-2 pp-shadow">
                    <div className="px-4 pb-2 pt-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Account</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-pp-primary"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-pp-primary">
                        <Package className="h-4 w-4" />
                      </span>
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50">
                        <LogOut className="h-4 w-4" />
                      </span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 text-xs font-bold text-white"
              >
                <User className="h-4 w-4" />
                Login
              </button>
            )}

            <HeaderIconLink href="/wishlist" icon={Heart} label="Wishlist" badge={wishlistCount} />
            <HeaderIconLink href="/cart" icon={ShoppingCart} label="Cart" badge={cartCount} prominent />
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg shadow-black/10 max-[360px]:h-9 max-[360px]:w-9"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <MobileIconLink href="/wishlist" icon={Heart} badge={wishlistCount} />
            <MobileIconLink href="/cart" icon={ShoppingCart} badge={cartCount} />
          </div>
        </div>

        {searchOpen && (
          <div className="relative border-t border-white/10 bg-[#081120]/55 px-4 pb-4 pt-3 backdrop-blur-2xl md:hidden">
            <form onSubmit={handleSearch} className="relative mx-auto max-w-3xl">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                key={`mobile-${pathname}-${initialQuery}`}
                type="text"
                autoFocus
                defaultValue={initialQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, categories..."
                className="h-12 w-full rounded-full border border-white/20 bg-white pl-11 pr-24 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-200 focus:ring-4 focus:ring-sky-200/40"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 inline-flex h-9 items-center justify-center rounded-full bg-pp-primary px-5 text-xs font-black uppercase tracking-[0.14em] text-white active:scale-[0.98]"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[84vw] max-w-sm flex-col overflow-hidden border-r border-white/10 bg-[#081120] text-white animate-in slide-in-from-left">
            <div className="pp-grid-bg relative overflow-hidden border-b border-white/10 p-6">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-pp-primary">
                  <Grid2x2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black tracking-[-0.04em]">pillipot</p>
                  <p className="text-xs font-medium text-white/60">Smart shopping, elevated UI</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-2 p-4">
              {mobileNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${pathname === item.href
                      ? "bg-white text-[#123468]"
                      : "bg-white/6 text-white/84 hover:bg-white/10"
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/10 p-4">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#123468]"
                >
                  <User className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.75rem] border border-white/50 bg-white/82 px-2 py-2 shadow-[0_20px_60px_rgba(11,24,46,0.16)] backdrop-blur-2xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          <BottomNavItem href="/" icon={Home} label="Home" active={pathname === "/"} />
          <BottomNavItem href="/wishlist" icon={Heart} label="Wishlist" active={pathname === "/wishlist"} badge={wishlistCount} />
          <BottomNavItem href="/cart" icon={ShoppingCart} label="Cart" active={pathname === "/cart"} badge={cartCount} />
          <BottomNavItem href="/orders" icon={Package} label="Orders" active={pathname === "/orders"} />
          <BottomNavItem
            href={user ? "/orders" : "/login"}
            icon={User}
            label="Account"
            active={false}
            onClick={!user ? () => setIsLoginModalOpen(true) : undefined}
          />
        </div>
      </nav>
    </>
  );
}

function HeaderIconLink({
  href,
  icon: Icon,
  label,
  badge,
  prominent = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  prominent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-full px-4 text-xs font-bold ${prominent
          ? "border border-white/22 bg-white/14 text-white"
          : "border border-white/14 bg-white/8 text-white/92"
        }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden xl:inline">{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pp-accent px-1 text-[10px] font-black text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function MobileIconLink({
  href,
  icon: Icon,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg shadow-black/10 max-[360px]:h-9 max-[360px]:w-9"
    >
      <Icon className="h-5 w-5" />
      {badge && badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pp-accent px-1 text-[10px] font-black text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function BottomNavItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  badge?: number;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 ${active ? "bg-[#edf4ff] text-pp-primary" : "text-slate-500"
        }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-semibold">{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pp-accent px-1 text-[9px] font-black text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function Header() {
  return (
    <React.Suspense fallback={<header className="sticky top-0 z-50 h-20 border-b border-white/40 bg-white/65" />}>
      <HeaderContent />
    </React.Suspense>
  );
}
