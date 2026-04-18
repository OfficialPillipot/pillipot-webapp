import Header from "@/components/layout/Header";
import CategoryBar from "@/components/layout/CategoryBar";
import ProductSection from "@/components/product/ProductSection";
import Footer from "@/components/layout/Footer";
import { PRODUCTS } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Gift, Truck } from "lucide-react";

export default function Home() {
  const mobileDeals = PRODUCTS.filter(p => p.category === "Mobiles").slice(0, 5);
  const electronicsDeals = PRODUCTS.filter(p => p.category === "Electronics").slice(0, 5);
  const fashionDeals = PRODUCTS.filter(p => p.category === "Fashion").slice(0, 5);
  const homeDeals = PRODUCTS.filter(p => p.category === "Home").slice(0, 5);
  const toysDeals = PRODUCTS.filter(p => p.category === "Toys").slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      <CategoryBar />

      <main className="flex-1 pp-container px-4 py-6">
        {/* Hero Banner */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-8 pp-gradient group cursor-pointer">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 md:p-12 lg:p-16 flex-1 z-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">Flash Sale Live Now</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                Up to <span className="text-yellow-300">80% Off</span><br />
                on Top Brands
              </h1>
              <p className="text-white/60 text-sm md:text-base mb-8 max-w-md">
                Shop the best electronics, fashion, home & more with free delivery and easy returns.
              </p>
              <Link href="/category/Top Offers" className="inline-flex items-center gap-2 bg-white text-pp-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative w-full md:w-[45%] h-64 md:h-[360px]">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800"
                alt="Flash Sale"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover md:object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Feature badges */}
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

        {/* Product Sections */}
        <ProductSection title="📱 Best of Mobiles" products={mobileDeals} viewAllLink="/category/Mobiles" />
        <ProductSection title="💻 Top Electronics" products={electronicsDeals} viewAllLink="/category/Electronics" />
        <ProductSection title="👗 Fashion Trends" products={fashionDeals} viewAllLink="/category/Fashion" />
        <ProductSection title="🏠 Home Essentials" products={homeDeals} viewAllLink="/category/Home" />
        <ProductSection title="🧸 Toys & More" products={toysDeals} viewAllLink="/category/Toys" />
      </main>

      <Footer />
    </div>
  );
}
