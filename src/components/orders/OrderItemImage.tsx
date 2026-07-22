"use client";

import React from "react";
import useSWR from "swr";
import { getProduct } from "@/lib/api";
import { LuPackage } from "react-icons/lu";

interface OrderItemImageProps {
  item: {
    productId?: string;
    productName?: string;
    imageUrl?: string;
    image?: string;
    productImage?: string;
    product_image?: string;
    product?: {
      imageUrl?: string;
      image?: string;
      images?: string[];
    };
  };
  className?: string;
  imgClassName?: string;
  iconClassName?: string;
}

export default function OrderItemImage({
  item,
  className = "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] shadow-sm sm:h-24 sm:w-24",
  imgClassName = "h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110",
  iconClassName = "h-8 w-8 text-slate-200",
}: OrderItemImageProps) {
  const directImage =
    item.imageUrl ||
    item.image ||
    item.productImage ||
    item.product_image ||
    item.product?.imageUrl ||
    item.product?.image ||
    item.product?.images?.[0];

  const productId = !directImage && item.productId ? item.productId : null;

  const { data: product } = useSWR(
    productId ? ["product-fallback", productId] : null,
    () => getProduct(productId!),
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const finalImageUrl = directImage || product?.imageUrl || (product as any)?.image;

  return (
    <div className={className}>
      {finalImageUrl ? (
        <img
          src={finalImageUrl}
          alt={item.productName || product?.name || "Product image"}
          className={imgClassName}
        />
      ) : (
        <LuPackage className={iconClassName} />
      )}
    </div>
  );
}
