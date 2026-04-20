"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone, Shirt, Monitor, Home as HomeIcon, Tv, Plane, Sparkles, ShoppingBasket, Tag, LayoutGrid } from "lucide-react";

import { getCategories, type Category } from "@/lib/api";
import { useState, useEffect } from "react";
import Image from "next/image";

const ICON_MAP: Record<string, any> = {
  "Mobiles": Smartphone,
  "Fashion": Shirt,
  "Electronics": Monitor,
  "Home": HomeIcon,
  "Appliances": Tv,
  "Travel": Plane,
  "Beauty": Sparkles,
  "Grocery": ShoppingBasket,
  "Top Offers": Tag,
};

const COLOR_MAP: Record<string, string> = {
  "Mobiles": "from-violet-500 to-purple-400",
  "Fashion": "from-pink-500 to-rose-400",
  "Electronics": "from-blue-500 to-cyan-400",
  "Home": "from-emerald-500 to-green-400",
  "Appliances": "from-slate-500 to-gray-400",
  "Travel": "from-sky-500 to-blue-400",
  "Beauty": "from-fuchsia-500 to-pink-400",
  "Grocery": "from-lime-500 to-green-400",
  "Top Offers": "from-red-500 to-orange-400",
};

export default function CategoryBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  const displayCategories = [
    { name: "Home", href: "/", icon: LayoutGrid, color: "from-pp-primary to-purple-400" },
    ...categories.map(c => ({
      name: c.name,
      href: `/category/${c.id}`,
      icon: ICON_MAP[c.name] || Smartphone,
      color: COLOR_MAP[c.name] || "from-pp-primary to-pp-accent",
      imageUrl: c.imageUrl
    }))
  ];


  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return decodeURIComponent(pathname).startsWith(decodeURIComponent(href));
  };

  return (
    <div className="bg-white pp-shadow border-b border-gray-100">
      <div className="pp-container flex items-center justify-start    gap-2 overflow-x-auto no-scrollbar py-2">
        {displayCategories.map((cat) => {
          const Icon = cat.icon;
          const active = isActive(cat.href);
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className={`flex flex-col items-center gap-1 min-w-[72px] cursor-pointer group ${active ? "scale-105" : ""}`}
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 overflow-hidden ${active ? "ring-2 ring-offset-2 ring-pp-primary shadow-md scale-90" : ""
                }`}>
                {(cat as any).imageUrl ? (
                  <Image src={(cat as any).imageUrl} alt={cat.name} width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <Icon className="w-4 h-4 text-white" />
                )}
              </div>
              <span className={`text-[11px] font-semibold transition-colors text-center leading-tight ${active ? "text-pp-primary font-bold" : "text-gray-600 group-hover:text-pp-primary"
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
