"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Smartphone,
  Shirt,
  Monitor,
  Home as HomeIcon,
  Tv,
  Plane,
  Sparkles,
  ShoppingBasket,
  Tag,
  LayoutGrid,
} from "lucide-react";
import type { Category } from "@/lib/api";
import Image from "next/image";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mobiles: Smartphone,
  Fashion: Shirt,
  Electronics: Monitor,
  Home: HomeIcon,
  Appliances: Tv,
  Travel: Plane,
  Beauty: Sparkles,
  Grocery: ShoppingBasket,
  "Top Offers": Tag,
};

const colorMap: Record<string, string> = {
  Mobiles: "from-sky-500 to-blue-600",
  Fashion: "from-pink-500 to-rose-500",
  Electronics: "from-indigo-500 to-cyan-500",
  Home: "from-emerald-500 to-teal-500",
  Appliances: "from-slate-500 to-slate-700",
  Travel: "from-blue-400 to-sky-500",
  Beauty: "from-fuchsia-500 to-pink-500",
  Grocery: "from-lime-500 to-emerald-500",
  "Top Offers": "from-orange-500 to-red-500",
};

export default function CategoryBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  const displayCategories = [
    { name: "Home", href: "/", icon: LayoutGrid, color: "from-[#0c1c33] via-pp-primary to-sky-400", imageUrl: undefined },
    ...categories.map((category) => ({
      name: category.name,
      href: `/category/${category.id}`,
      icon: iconMap[category.name] || Smartphone,
      color: colorMap[category.name] || "from-pp-primary to-pp-accent",
      imageUrl: category.imageUrl,
    })),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return decodeURIComponent(pathname).startsWith(decodeURIComponent(href));
  };

  return (
    <div className="sticky top-16 z-40 border-b border-slate-200/70 bg-white/88 backdrop-blur-2xl shadow-sm">
      <div className="pp-container py-0">
        <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto sm:gap-1">
          {displayCategories.map((category) => {
            const active = isActive(category.href);
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={category.href}
                className={`group relative flex min-w-[60px] flex-col items-center gap-1.5 px-2.5 py-3 text-center transition-colors duration-150 sm:min-w-[76px] sm:px-3 md:min-w-[88px] md:py-3.5 ${
                  active
                    ? "text-pp-primary"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {/* Active indicator line */}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-pp-primary" />
                )}

                {/* Icon bubble */}
                <div
                  className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${category.color} shadow-md transition-transform duration-200 group-hover:scale-105 sm:h-9 sm:w-9 md:h-10 md:w-10 md:rounded-2xl`}
                >
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-4 w-4 text-white md:h-4.5 md:w-4.5" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold leading-tight tracking-wide transition-colors ${
                    active ? "font-bold text-pp-primary" : ""
                  }`}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
