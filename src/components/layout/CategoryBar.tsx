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
    <div className="sticky top-14 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-2xl">
      <div className="pp-container py-1.5 md:py-2.5">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto md:gap-2.5">
          {displayCategories.map((category) => {
            const active = isActive(category.href);
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={category.href}
                className={`group flex min-w-[68px] flex-col items-center gap-1.5 rounded-[1.25rem] border px-2 py-1.5 text-center md:min-w-[92px] md:gap-2 md:rounded-[1.55rem] md:px-3 md:py-2.5 ${active
                    ? "border-sky-200 bg-white shadow-[0_20px_40px_rgba(9,22,43,0.1)]"
                    : "border-white/40 bg-white/65 hover:border-sky-100 hover:bg-white"
                  }`}
              >
                <div
                  className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${category.color} shadow-lg shadow-slate-900/12 min-[360px]:h-9 min-[360px]:w-9 md:h-12 md:w-12 md:rounded-2xl`}
                >
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-5 w-5 text-white" />
                  )}
                </div>
                <span
                  className={`text-[5px] font-bold leading-[1.05] min-[360px]:text-[6px] md:text-[10px] ${active ? "text-pp-primary" : "text-slate-600 group-hover:text-slate-900"
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
