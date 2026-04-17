"use client";

import { use, useState, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PRODUCTS } from "@/data/products";
import Image from "next/image";
import { Star, ShoppingCart, Zap, ShieldCheck, Tag, Truck, RotateCcw, Heart, Share2, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { notFound } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) notFound();

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHoverZoom, setIsHoverZoom] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = () => addToCart(product);
  const handleBuyNow = () => { addToCart(product); router.push("/checkout"); };

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const goNext = () => setSelectedIndex((i) => (i + 1) % allImages.length);
  const goPrev = () => setSelectedIndex((i) => (i - 1 + allImages.length) % allImages.length);

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1 pp-container px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-1.5 mb-6">
          <a href="/" className="hover:text-pp-primary">Home</a>
          <span className="text-gray-300">›</span>
          <a href={`/category/${product.category}`} className="hover:text-pp-primary">{product.category}</a>
          <span className="text-gray-300">›</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Gallery */}
          <div className="lg:w-[45%] flex flex-col sm:flex-row gap-3">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:max-h-[500px]">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedIndex === i ? "border-pp-primary shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image with zoom */}
            <div className="flex-1 flex flex-col gap-3 order-1 sm:order-2">
              <div
                ref={imageRef}
                className="bg-white rounded-2xl border border-gray-100 relative aspect-square pp-shadow cursor-crosshair overflow-hidden"
                onMouseEnter={() => setIsHoverZoom(true)}
                onMouseLeave={() => setIsHoverZoom(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setZoomOpen(true)}
              >
                <Image
                  src={allImages[selectedIndex]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className={`object-contain p-4 transition-transform duration-200 ${isHoverZoom ? "scale-150" : "scale-100"}`}
                  style={isHoverZoom ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                  priority
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-pp-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    {product.discount}% OFF
                  </div>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-100 ${
                      isInWishlist(product.id) ? "bg-pp-accent text-white" : "bg-white/90 backdrop-blur-sm hover:bg-pp-accent hover:text-white"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-white" : ""}`} />
                  </button>
                  <button onClick={(e) => e.stopPropagation()} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pp-primary hover:text-white transition-all shadow-sm border border-gray-100">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 z-10">
                  <ZoomIn className="w-3 h-3" /> Hover to zoom
                </div>
                {/* Arrow navigation */}
                {allImages.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white z-10">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white z-10">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart} className="flex-1 bg-pp-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pp-primary-dark shadow-lg hover:shadow-xl transition-all text-sm">
                  <ShoppingCart className="w-5 h-5" /> ADD TO CART
                </button>
                <button onClick={handleBuyNow} className="flex-1 pp-gradient-warm text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl shadow-lg transition-all text-sm">
                  <Zap className="w-5 h-5" /> BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:w-[55%] flex flex-col gap-5">
            <div>
              <p className="text-pp-primary text-xs font-bold uppercase tracking-widest mb-1">{product.brand}</p>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-pp-success text-white text-sm font-bold px-2.5 py-1 rounded-lg">
                {product.rating} <Star className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="text-gray-500 text-sm">{product.reviews.toLocaleString()} ratings & reviews</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-gray-400 line-through text-lg">{formatPrice(product.originalPrice)}</span>
                  <span className="text-pp-success text-base font-bold">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            {/* Offers */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 pp-shadow">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">🎉 Available Offers</h3>
              <ul className="space-y-2.5">
                {[
                  "10% instant discount on Pillipot Pay, up to ₹1,000",
                  "Extra 15% off on first purchase with code WELCOME15",
                  "Free delivery on this item",
                  "Buy 2, get extra ₹250 off on next purchase",
                ].map((offer, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                    <Tag className="w-4 h-4 text-pp-primary shrink-0 mt-0.5" />
                    <span>{offer}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 flex flex-col items-center gap-2 text-center">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-pp-primary" />
                <span className="text-[10px] md:text-xs font-semibold text-gray-700">Free Delivery</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 flex flex-col items-center gap-2 text-center">
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-pp-primary" />
                <span className="text-[10px] md:text-xs font-semibold text-gray-700">7 Day Returns</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 flex flex-col items-center gap-2 text-center">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-pp-primary" />
                <span className="text-[10px] md:text-xs font-semibold text-gray-700">1 Year Warranty</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 pp-shadow">
              <h3 className="text-base font-bold text-gray-900 mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Zoom Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setZoomOpen(false)}>
          <button onClick={() => setZoomOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 z-10">
            <X className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white/60 text-sm font-medium">
            {selectedIndex + 1} / {allImages.length}
          </div>

          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative w-[90vw] h-[80vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={allImages[selectedIndex]}
              alt={product.name}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedIndex === i ? "border-white shadow-lg" : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
