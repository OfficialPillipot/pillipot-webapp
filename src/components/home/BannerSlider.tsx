"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ArrowRight, Zap } from "lucide-react";
import type { Banner } from "@/lib/api";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface BannerSliderProps {
  banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="px-4 md:px-6 lg:px-30 ">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="banner-swiper rounded-1xl overflow-hidden shadow-xl"
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        } as React.CSSProperties}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link href={banner.linkUrl || "#"} className="block relative w-full h-full group cursor-pointer aspect-[16/7] md:aspect-[22/5] lg:min-h-[280px]">
              {/* Background Image - Full Width & Height */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Overlay Gradient for Text Readability */}
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

              {/* Text Content - Positioned Left */}
              <div className="relative z-20 h-full pp-container px-6 lg:px-12 flex flex-col justify-center">
                <div className="max-w-xl text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                    <span className="text-white/90 text-xs font-bold uppercase tracking-[0.2em] drop-shadow-sm">
                      Limited Time Offer
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
                    {banner.title}
                  </h2>

                  {banner.description && (
                    <p className="text-white/80 text-sm md:text-xl mb-10 max-w-md line-clamp-3 md:line-clamp-none drop-shadow-md font-medium leading-relaxed">
                      {banner.description}
                    </p>
                  )}

                  {banner.linkUrl && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-3 bg-white text-pp-primary px-10 py-4 rounded-2xl font-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-pp-primary hover:text-white transition-all duration-300 text-base shadow-xl group/btn">
                        Shop Now
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .banner-swiper .swiper-button-next,
        .banner-swiper .swiper-button-prev {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .banner-swiper .swiper-button-next:hover,
        .banner-swiper .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.1);
        }
        .banner-swiper .swiper-button-next:after,
        .banner-swiper .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
        .banner-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          opacity: 0.5;
          background: #fff;
          transition: all 0.3s ease;
        }
        .banner-swiper .swiper-pagination-bullet-active {
          width: 25px;
          border-radius: 5px;
          opacity: 1;
        }
        @media (max-width: 768px) {
          .banner-swiper .swiper-button-next,
          .banner-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerSlider;
