"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/api";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface BannerSliderProps {
  banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  if (!banners?.length) return null;

  return (
    <section className="pp-container pt-5">
      <Swiper
        spaceBetween={20}
        centeredSlides
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation
        modules={[Autoplay, Pagination, Navigation]}
        className="banner-swiper overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_30px_80px_rgba(9,22,43,0.16)]"
        style={
          {
            "--swiper-navigation-color": "#ffffff",
            "--swiper-pagination-color": "#ffffff",
          } as React.CSSProperties
        }
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link
              href={banner.linkUrl || "#"}
              className="group relative block min-h-[280px] overflow-hidden sm:min-h-[340px] md:min-h-[470px]"
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,17,32,0.86)_12%,rgba(8,17,32,0.48)_40%,rgba(8,17,32,0.12)_70%,rgba(8,17,32,0.34)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(101,197,255,0.32),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,190,92,0.25),transparent_20%)]" />

              <div className="pp-container relative flex min-h-[280px] items-center py-8 sm:min-h-[340px] md:min-h-[470px] md:py-10">
                <div className="max-w-2xl text-white">


                  <h2 className="mt-4 max-w-xl text-2xl font-black tracking-[-0.06em] text-white sm:text-4xl md:mt-5 md:text-6xl">
                    {banner.title}
                  </h2>

                  {banner.description ? (
                    <p className="mt-3 max-w-lg text-xs leading-6 text-white/78 sm:text-sm sm:leading-7 md:mt-5 md:text-base">
                      {banner.description}
                    </p>
                  ) : null}

                  {banner.linkUrl ? (
                    <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#123468] shadow-[0_20px_45px_rgba(0,0,0,0.18)] sm:px-6 sm:py-3 sm:text-sm">
                        Shop now
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <span className="rounded-full border border-white/16 bg-white/8 px-3 py-2 text-[11px] font-semibold text-white/75 sm:px-4 sm:py-3 sm:text-xs">
                        Fast-moving picks and latest launches
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .banner-swiper .swiper-button-next,
        .banner-swiper .swiper-button-prev {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(14px);
        }

        .banner-swiper .swiper-button-next:after,
        .banner-swiper .swiper-button-prev:after {
          font-size: 18px;
          font-weight: 800;
        }

        .banner-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.72);
          opacity: 0.58;
        }

        .banner-swiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 999px;
          opacity: 1;
        }

        @media (max-width: 768px) {
          .banner-swiper .swiper-button-next,
          .banner-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default BannerSlider;
