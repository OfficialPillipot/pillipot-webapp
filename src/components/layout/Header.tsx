"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LuSearch, LuShoppingCart, LuUser, LuHeart, LuMenu, LuX, LuHouse, LuPackage, LuChevronDown, LuGrid2X2, LuLogOut } from "react-icons/lu";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const mobileNav = [
  { label: "Home", href: "/", icon: LuHouse },
  { label: "My Orders", href: "/orders", icon: LuPackage },
  { label: "My Wishlist", href: "/wishlist", icon: LuHeart },
  { label: "My Cart", href: "/cart", icon: LuShoppingCart },
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
        <div className="absolute inset-x-0 top-0 h-16 pp-gradient opacity-95" />
        <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_24%),linear-gradient(180deg,rgba(8,17,32,0.05),transparent)]" />

        <div className="pp-container relative flex min-h-16 items-center gap-2 py-2">
          {/* <button
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg shadow-black/10 min-[360px]:h-9 min-[360px]:w-9"
            aria-label="Open menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button> */}

          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/25 bg-white/90 shadow-[0_20px_50px_rgba(10,25,60,0.22)] transition-transform duration-300 group-hover:-translate-y-0.5 min-[360px]:h-9 min-[360px]:w-9">
              <span className="bg-linear-to-br from-pp-accent via-pp-primary to-pp-success bg-clip-text text-base font-black text-transparent min-[360px]:text-lg">
                P
              </span>
            </div>
            <div className="min-w-0 leading-none text-white">
              <div className="flex items-center">
                <span className="flex items-center text-[0.92rem] font-black tracking-[-0.04em] min-[360px]:text-base md:text-[1.15rem]">
                  <span className="text-pp-accent">p</span>
                  <span className="text-pp-cyan">i</span>
                  <span className="text-pp-cyan">l</span>
                  <span className="text-pp-primary">l</span>
                  <span className="text-pp-primary">i</span>
                  <span className="text-pp-accent-warm">p</span>
                  <span className="text-pp-success">o</span>
                  <span className="text-pp-accent">t</span>
                </span>
              </div>
            </div> */}

            <img className="h-12" src="/logopilli.png" alt="" />
          </Link>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <form onSubmit={handleSearch} className="relative w-[min(42vw,640px)] min-w-[280px]">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/58">
                <LuSearch className="h-4 w-4" />
              </div>
              <input
                key={`desktop-${pathname}-${initialQuery}`}
                type="text"
                defaultValue={initialQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="h-11 w-full rounded-full border border-white/14 bg-white/12 pl-11 pr-28 text-[0.875rem] font-medium text-white outline-none placeholder:text-white/48 focus:border-white/38 focus:bg-white/18"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 inline-flex h-8 min-w-[88px] items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#123468] shadow-lg shadow-black/10 hover:-translate-y-0.5"
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
                    <LuUser className="h-4 w-4" />
                  </span>
                  <span className="max-w-28 truncate">{user.name}</span>
                  <LuChevronDown className={`h-3.5 w-3.5 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 rounded-[1.4rem] border border-slate-200/80 bg-white p-2 pp-shadow">
                    <div className="px-4 pb-2 pt-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Account</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-pp-primary"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-pp-primary">
                        <LuUser className="h-4 w-4" />
                      </span>
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-pp-primary"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-pp-primary">
                        <LuPackage className="h-4 w-4" />
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
                        <LuLogOut className="h-4 w-4" />
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
                <LuUser className="h-4 w-4" />
                Login
              </button>
            )}

            <HeaderIconLink href="/wishlist" icon={LuHeart} label="Wishlist" badge={wishlistCount} />
            <HeaderIconLink href="/cart" icon={LuShoppingCart} label="Cart" badge={cartCount} prominent />
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg shadow-black/10 max-[360px]:h-9 max-[360px]:w-9"
              aria-label="Search"
            >
              <LuSearch className="h-5 w-5" />
            </button>

            <MobileIconLink href="/wishlist" icon={LuHeart} badge={wishlistCount} />
            <MobileIconLink href="/cart" icon={LuShoppingCart} badge={cartCount} />
          </div>
        </div>

        {searchOpen && (
          <div className="relative border-t border-white/10 bg-[#081120]/55 px-4 pb-4 pt-3 backdrop-blur-2xl md:hidden">
            <form onSubmit={handleSearch} className="relative mx-auto max-w-3xl">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                <LuSearch className="h-4 w-4" />
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

      {/* {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[84vw] max-w-sm flex-col overflow-hidden border-r border-white/10 bg-[#081120] text-white animate-in slide-in-from-left">
            <div className="pp-grid-bg relative overflow-hidden border-b border-white/10 px-6 pb-6 pt-24">
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
      )} */}

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.75rem] border border-white/50 bg-white/82 px-2 py-2 shadow-[0_20px_60px_rgba(11,24,46,0.16)] backdrop-blur-2xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          <BottomNavItem href="/" icon={LuHouse} label="Home" active={pathname === "/"} />
          <BottomNavItem href="/wishlist" icon={LuHeart} label="Wishlist" active={pathname === "/wishlist"} badge={wishlistCount} />
          <BottomNavItem href="/cart" icon={LuShoppingCart} label="Cart" active={pathname === "/cart"} badge={cartCount} />
          <BottomNavItem href="/orders" icon={LuPackage} label="Orders" active={pathname === "/orders"} />
          <BottomNavItem
            href={user ? "/account" : "/login"}
            icon={LuUser}
            label="Account"
            active={pathname === "/account"}
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
      className={`relative inline-flex h-10 min-w-[112px] items-center justify-center gap-2 rounded-full px-4 text-xs font-bold transition-all duration-200 ${prominent
        ? "border border-white/22 bg-white/14 text-white hover:bg-white/20"
        : "border border-white/14 bg-white/8 text-white/92 hover:bg-white/14"
        }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden lg:inline">{label}</span>
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
    <React.Suspense fallback={<header className="sticky top-0 z-50 h-16 border-b border-white/40 pp-gradient opacity-95" />}>
      <HeaderContent />
    </React.Suspense>
  );
}
