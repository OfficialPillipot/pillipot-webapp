"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone, Shirt, Monitor, Home as HomeIcon, Tv, Plane, Sparkles, ShoppingBasket, Tag, LayoutGrid } from "lucide-react";

const CATEGORIES = [
  { name: "Home", href: "/", icon: LayoutGrid, color: "from-pp-primary to-purple-400" },
  { name: "Top Offers", href: "/category/Top%20Offers", icon: Tag, color: "from-red-500 to-orange-400" },
  { name: "Mobiles", href: "/category/Mobiles", icon: Smartphone, color: "from-violet-500 to-purple-400" },
  { name: "Fashion", href: "/category/Fashion", icon: Shirt, color: "from-pink-500 to-rose-400" },
  { name: "Electronics", href: "/category/Electronics", icon: Monitor, color: "from-blue-500 to-cyan-400" },
  { name: "Home & Living", href: "/category/Home", icon: HomeIcon, color: "from-emerald-500 to-green-400" },
  { name: "Appliances", href: "/category/Appliances", icon: Tv, color: "from-slate-500 to-gray-400" },
  { name: "Travel", href: "/category/Travel", icon: Plane, color: "from-sky-500 to-blue-400" },
  { name: "Beauty", href: "/category/Beauty", icon: Sparkles, color: "from-fuchsia-500 to-pink-400" },
  { name: "Grocery", href: "/category/Grocery", icon: ShoppingBasket, color: "from-lime-500 to-green-400" },
];

export default function CategoryBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return decodeURIComponent(pathname).startsWith(decodeURIComponent(href));
  };

  return (
    <div className="bg-white pp-shadow border-b border-gray-100">
      <div className="pp-container flex items-center justify-between px-4 lg:px-8 gap-3 overflow-x-auto no-scrollbar py-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = isActive(cat.href);
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className={`flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group ${active ? "scale-105" : ""}`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 ${
                active ? "ring-2 ring-offset-2 ring-pp-primary shadow-md scale-110" : ""
              }`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-[11px] font-semibold transition-colors text-center leading-tight ${
                active ? "text-pp-primary font-bold" : "text-gray-600 group-hover:text-pp-primary"
              }`}>
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
