"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LuSearch, LuShoppingCart, LuUser, LuHeart, LuMenu, LuX, LuHouse, LuPackage, LuChevronDown, LuGrid2X2, LuLogOut, LuArrowRight, LuMapPin, LuLoaderCircle, LuCheck } from "react-icons/lu";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { getProducts, checkPincodeServiceability, Product } from "@/lib/api";

import Logo from "@/components/common/Logo";

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
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const mobileSearchRef = React.useRef<HTMLDivElement>(null);

  // Global Pincode State in Header
  const [globalPin, setGlobalPin] = React.useState("");
  const [globalPinLocation, setGlobalPinLocation] = React.useState("");
  const [pinInput, setPinInput] = React.useState("");
  const [isCheckingPin, setIsCheckingPin] = React.useState(false);
  const [mobilePinModalOpen, setMobilePinModalOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedPin = localStorage.getItem("global_delivery_pincode") || "";
      const savedLoc = localStorage.getItem("global_delivery_pincode_location") || "";
      if (savedPin) {
        setGlobalPin(savedPin);
        setPinInput(savedPin);
        setGlobalPinLocation(savedLoc);
      }
    } catch { }
  }, []);

  const handleApplyHeaderPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pinInput.trim();
    if (!/^\d{6}$/.test(clean)) return;

    setIsCheckingPin(true);
    try {
      const res = await checkPincodeServiceability(clean);
      setGlobalPin(clean);
      const loc = res.city || res.district ? `${res.city || res.district}${res.state ? `, ${res.state}` : ""}` : res.state || "";
      setGlobalPinLocation(loc);
      try {
        localStorage.setItem("global_delivery_pincode", clean);
        if (loc) localStorage.setItem("global_delivery_pincode_location", loc);
      } catch { }
      window.dispatchEvent(new CustomEvent("global_pincode_changed", { detail: { pincode: clean, location: loc } }));
      setMobilePinModalOpen(false);
    } catch {
      setGlobalPin(clean);
      try {
        localStorage.setItem("global_delivery_pincode", clean);
      } catch { }
      window.dispatchEvent(new CustomEvent("global_pincode_changed", { detail: { pincode: clean, location: "" } }));
      setMobilePinModalOpen(false);
    } finally {
      setIsCheckingPin(false);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
      if (
        searchRef.current && !searchRef.current.contains(target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(target))
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Handle Search Suggestions with Debounce
  React.useEffect(() => {
    if (!search.trim() || search.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getProducts(undefined, search.trim());
        setSuggestions(results.slice(0, 6)); // Top 6 suggestions
        setShowSuggestions(true);
      } catch (error) {
        console.error("Suggestion fetch failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    setShowSuggestions(false);
  };

  const navigateToProduct = (productId: string) => {
    router.push(`/product/${productId}`);
    setShowSuggestions(false);
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

          <Link href="/" className="group flex shrink-0 items-center">
            <Logo variant="dark" />
          </Link>

          {/* Desktop Global Pincode Input */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1 text-white transition-all focus-within:border-white/40 focus-within:bg-white/18 shrink-0 ml-1 lg:ml-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/14 text-white shrink-0">
              <LuMapPin className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-semibold text-white/70 leading-none">Deliver to</span>
                {globalPinLocation && (
                  <span className="text-[9px] font-bold text-sky-200 truncate max-w-[85px] leading-none">
                    ({globalPinLocation})
                  </span>
                )}
              </div>
              <form onSubmit={handleApplyHeaderPin} className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="PIN code"
                  className="w-16 bg-transparent text-xs font-black text-white placeholder:text-white/50 outline-none tracking-wider"
                />
                <button
                  type="submit"
                  disabled={isCheckingPin || pinInput.length !== 6}
                  className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#123468] hover:bg-sky-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  {isCheckingPin ? <LuLoaderCircle className="h-2.5 w-2.5 animate-spin" /> : "Apply"}
                </button>
              </form>
            </div>
          </div>

          {/* Mobile PIN Code Selector Button */}
          <button
            type="button"
            onClick={() => setMobilePinModalOpen(true)}
            className="flex md:hidden items-center gap-1 rounded-full border border-white/20 bg-white/14 px-2 py-1.5 text-white shrink-0 active:scale-95 transition-all text-xs ml-1"
            title="Set delivery location"
          >
            <LuMapPin className="h-3.5 w-3.5 text-white/80" />
            <span className="text-[10px] font-bold max-w-[45px] truncate">
              {globalPin || "PIN"}
            </span>
          </button>

          {/* Mobile Search Bar (Directly open in header) */}
          <div className="flex-1 min-w-0 md:hidden ml-2 sm:ml-4" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/60">
                <LuSearch className="h-4 w-4" />
              </div>
              <input
                key={`mobile-${pathname}-${initialQuery}`}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length > 0 && setShowSuggestions(true)}
                placeholder="Search products..."
                className="h-10 w-full rounded-full border border-white/20 bg-white/15 pl-9 pr-8 text-xs font-medium text-white outline-none placeholder:text-white/60 focus:border-white/40 focus:bg-white/25 transition-all"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setSuggestions([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
                >
                  <LuX className="h-4 w-4" />
                </button>
              )}

              {/* Suggestions Dropdown (Mobile) */}
              {showSuggestions && (suggestions.length > 0 || isSearching) && (
                <div className="absolute left-0 right-0 top-full mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl z-[60] max-h-[70vh] overflow-y-auto">
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Suggestions</p>
                    {isSearching && suggestions.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-pp-primary border-t-transparent" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {suggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => navigateToProduct(item.id)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left active:bg-slate-100 transition-colors"
                          >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white p-0.5">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                              ) : (
                                <LuPackage className="h-full w-full text-slate-300" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-slate-900">{item.name}</p>
                              <p className="text-[11px] font-semibold text-pp-primary">₹{item.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="ml-auto hidden items-center gap-3 md:flex" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-[min(42vw,640px)] min-w-[280px]">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/58">
                <LuSearch className="h-4 w-4" />
              </div>
              <input
                key={`desktop-${pathname}-${initialQuery}`}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length > 0 && setShowSuggestions(true)}
                placeholder="Search products, brands, categories..."
                className="h-11 w-full rounded-full border border-white/14 bg-white/12 pl-11 pr-28 text-[0.875rem] font-medium text-white outline-none placeholder:text-white/48 focus:border-white/38 focus:bg-white/18"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 inline-flex h-8 min-w-[88px] items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#123468] shadow-lg shadow-black/10 hover:-translate-y-0.5"
              >
                Search
              </button>

              {/* Clear Search Button (Desktop) */}
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setSuggestions([]); }}
                  className="absolute right-[100px] top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                >
                  <LuX className="h-4 w-4" />
                </button>
              )}

              {/* Suggestions Dropdown (Desktop) */}
              {showSuggestions && (suggestions.length > 0 || isSearching) && (
                <div className="absolute top-full mt-2 w-full overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/95 backdrop-blur-3xl shadow-2xl animate-in zoom-in slide-in-from-top-2">
                  <div className="p-2">
                    <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Suggestions</p>
                    {isSearching && suggestions.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-pp-primary border-t-transparent" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {suggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => navigateToProduct(item.id)}
                            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition hover:bg-slate-50 group"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white p-1">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                              ) : (
                                <LuPackage className="h-full w-full text-slate-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                              <p className="text-[11px] font-bold text-pp-primary uppercase tracking-wider">{item.brand || "PILLIPOT"}</p>
                            </div>
                            <LuArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

        </div>
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

      {/* Mobile Pincode Modal */}
      {mobilePinModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pp-primary/10 text-pp-primary">
                  <LuMapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Delivery Location</h4>
                  <p className="text-[11px] text-slate-500">Enter PIN code to check global availability</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobilePinModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyHeaderPin} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit PIN"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-pp-primary focus:bg-white tracking-wider"
              />
              <button
                type="submit"
                disabled={isCheckingPin || pinInput.length !== 6}
                className="px-4 py-2.5 rounded-xl bg-pp-primary text-white font-black text-xs hover:bg-pp-primary/90 disabled:opacity-50 transition-colors"
              >
                {isCheckingPin ? <LuLoaderCircle className="h-4 w-4 animate-spin text-white" /> : "Apply"}
              </button>
            </form>

            {globalPin && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-400">Current PIN: <strong className="text-slate-700">{globalPin}</strong></span>
                {globalPinLocation && <span className="font-semibold text-emerald-700">✓ {globalPinLocation}</span>}
              </div>
            )}
          </div>
        </div>
      )}
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
