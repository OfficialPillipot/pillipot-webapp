"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useLayoutEffect } from "react";
import { type Product } from "@/lib/api";
import Image from "next/image";
import { Star, ShoppingCart, Zap, ShieldCheck, Tag, Truck, RotateCcw, Heart, Share2, X, ChevronLeft, ChevronRight, ZoomIn, Play } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProductClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, setIsLoginModalOpen } = useAuth();
  
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [product.id]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHoverZoom, setIsHoverZoom] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const allImages = [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean) as string[];
  if (allImages.length === 0) {
    allImages.push(`data:image/svg+xml;base64,${btoa('<svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="800" fill="#F3F4FB"/><path d="M400 330V470M330 400H470" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round"/><circle cx="400" cy="400" r="100" stroke="#D1D5DB" stroke-width="4" stroke-dasharray="8 8"/><text x="400" y="550" text-anchor="middle" fill="#9CA3AF" font-family="sans-serif" font-size="20" font-weight="600" letter-spacing="0.1em">NO IMAGE AVAILABLE</text></svg>')}`);
  }

  const handleAddToCart = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    addToCart(product);
  };

  const handleBuyNow = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    addToCart(product);
    router.push("/checkout");
  };

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
    <>
    <div className="bg-[#f1f3f6] min-h-screen">
      <main className="max-w-[1280px] mx-auto bg-white min-h-screen shadow-sm border-x border-gray-200">
        
        {/* Breadcrumb - Flipkart style top padding */}
        <div className="px-4 pt-4">
          <nav className="text-xs text-gray-500 flex items-center gap-1.5 opacity-80">
            <a href="/" className="hover:text-blue-600">Home</a>
            <span className="text-gray-300">›</span>
            <a href={`/category/${product.categoryId}`} className="hover:text-blue-600 truncate max-w-[150px]">View Series</a>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row p-4 gap-6">
          
          {/* Left Column: Fixed/Sticky Gallery & Actions */}
          <div className="lg:w-[40%] flex flex-col gap-4">
            <div className="lg:sticky lg:top-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Thumbnails - Vertical on Desktop */}
                <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:max-h-[450px]">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`relative w-14 h-14 shrink-0 rounded border transition-all p-1 bg-white ${
                        selectedIndex === i ? "border-[#2874f0] shadow-sm" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image src={img} alt={`${product.name} view ${i + 1}`} fill sizes="56px" className="object-contain" />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div 
                  ref={imageRef}
                  className="flex-1 order-1 sm:order-2 relative aspect-[4/5] sm:aspect-square bg-white border border-gray-100 p-4 cursor-zoom-in overflow-hidden"
                  onMouseEnter={() => setIsHoverZoom(true)}
                  onMouseLeave={() => setIsHoverZoom(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => setZoomOpen(true)}
                >
                  <Image
                    src={allImages[selectedIndex]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className={`object-contain transition-transform duration-200 ${isHoverZoom ? "scale-200" : "scale-100"}`}
                    style={isHoverZoom ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                    priority // Critical for LCP optimization
                  />
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (!user) { setIsLoginModalOpen(true); return; }
                      toggleWishlist(product); 
                    }}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white border border-gray-100 shadow-sm ${
                      isInWishlist(product.id) ? "text-red-500" : "text-gray-300 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Action Buttons - Distinctive Flipkart colors */}
              <div className="flex gap-2">
                <button 
                  onClick={handleAddToCart} 
                  className="flex-1 bg-[#ff9f00] text-white py-4 rounded font-bold flex items-center justify-center gap-2 hover:bg-[#fb9200] transition-colors text-sm shadow-sm"
                >
                  <ShoppingCart className="w-5 h-5" /> ADD TO CART
                </button>
                <button 
                  onClick={handleBuyNow} 
                  className="flex-1 bg-[#fb641b] text-white py-4 rounded font-bold flex items-center justify-center gap-2 hover:bg-[#f4510b] transition-colors text-sm shadow-sm"
                >
                  <Zap className="w-5 h-5" /> BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Details Scrollable */}
          <div className="lg:w-[60%] flex flex-col gap-6">
            <div>
              <p className="text-pp-primary text-xs font-bold uppercase tracking-widest mb-1">{product.brand || "Pillipot"}</p>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-pp-success text-white text-sm font-bold px-2.5 py-1 rounded-lg">
                {product.rating || 0} <Star className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="text-gray-500 text-sm">{(product.reviews || 0).toLocaleString()} ratings & reviews</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
              {(product.discount ?? 0) > 0 && (
                <>
                  <span className="text-gray-400 line-through text-lg">{formatPrice(product.originalPrice || product.price)}</span>
                  <span className="text-pp-success text-base font-bold">Save {formatPrice((product.originalPrice || product.price) - product.price)}</span>
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

            {/* Video */}
            {product.videoUrl && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 pp-shadow">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-pp-primary" /> Product Video
                </h3>
                <div className="aspect-video relative rounded-xl overflow-hidden bg-black/5">
                  <video controls className="w-full h-full">
                    <source src={product.videoUrl} />
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>

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
    </>
  );
}
