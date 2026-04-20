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
        <div className="px-4 md:px-6 lg:px-8 pt-6">
          <div className="relative w-full overflow-hidden mb-12 pp-gradient group cursor-pointer shadow-lg rounded-3xl">
            <div className="pp-container px-6 lg:px-12">
              <div className="flex flex-col md:flex-row items-center min-h-[200px] md:min-h-[280px]">
                <div className="p-8 md:p-10 lg:p-14 flex-1 z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Flash Sale Live</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                    Up to <span className="text-yellow-300">40% Off</span> Top Brands
                  </h1>
                  <p className="text-white/70 text-sm md:text-base mb-8 max-w-md">
                    Shop the best electronics, fashion & home with free delivery and easy returns.
                  </p>
                  <Link href="/category/Top Offers" className="inline-flex items-center gap-2 bg-white text-pp-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-sm">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="relative w-full md:w-[40%] h-48 md:h-[320px]">
                  <Image
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800"
                    alt="Flash Sale"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-contain"
                    priority // Critical for LCP
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 md:px-16 py-6">
        {/* Feature badges - Fast Static Content */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
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
        </div>

        {/* Streaming Data Section */}
        <Suspense fallback={<ProductSectionSkeleton />}>
          <ProductFeed />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
