import Header from "@/components/layout/Header";
import CategoryBar from "@/components/layout/CategoryBar";
import ProductSection from "@/components/product/ProductSection";
import Footer from "@/components/layout/Footer";
import { getProducts, getCategories, getBanners } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Gift, Truck } from "lucide-react";
import { Suspense } from "react";
import { ProductSectionSkeleton } from "@/components/skeletons/ProductSkeleton";
import BannerSlider from "@/components/home/BannerSlider";
import banner from "../../public/dummy-banner.jpeg"

async function ProductFeed() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const sections = categories.map(cat => ({
    title: cat.name,
    products: products.filter(p => p.categoryId === cat.id).slice(0, 5),
    link: `/category/${cat.id}`
  })).filter(s => s.products.length > 0);

  return (
    <>
      {sections.map((s, i) => (
        <ProductSection key={i} title={s.title} products={s.products} viewAllLink={s.link} />
      ))}
    </>
  );
}

export default async function Home() {
  // Fetch categories early for the CategoryBar
  const [categories, banners] = await Promise.all([
    getCategories(),
    getBanners()
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      <CategoryBar categories={categories} />

      {/* Dynamic Banner Slider */}
      {banners.length > 0 ? (
        <BannerSlider banners={banners} />
      ) : (
        /* Original Hero Banner - Keep as fallback if no marketing banners are defined */
        <div className="px-4 md:px-6 lg:px-30 pt-6">
          <div className="relative w-full overflow-hidden  pp-gradient group cursor-pointer shadow-lg rounded-2xl">
            <div className="pp-container px-6 lg:px-12">
              <div className="flex flex-col md:flex-row items-center min-h-[200px] md:min-h-[280px]">
                <div className=" flex-1 z-10">

                  <img src={banner.src} className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4" alt="Comming Soon" />

                  {/* <Link href="/category/Top Offers" className="inline-flex items-center gap-2 bg-white text-pp-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-sm">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Link> */}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 md:px-30 py-6">
        {/* Feature badges - Fast Static Content */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 flex items-center gap-3 pp-shadow border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-pp-primary" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Free Delivery</p>
              <p className="text-xs text-gray-500">On orders above ₹499</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-3 pp-shadow border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Gift className="w-5 h-5 text-pp-accent" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Best Deals</p>
              <p className="text-xs text-gray-500">Up to 70% cashback</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-3 pp-shadow border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-pp-success" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Easy Returns</p>
              <p className="text-xs text-gray-500">7-day replacement policy</p>
            </div>
          </div>
        </div> */}

        {/* Streaming Data Section */}
        <Suspense fallback={<ProductSectionSkeleton />}>
          <ProductFeed />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
