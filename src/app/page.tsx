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
import BannerSkeleton from "@/components/skeletons/BannerSkeleton";

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
        <BannerSkeleton />
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
