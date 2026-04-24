"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { type Product } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Zap, ShieldCheck, Tag, Truck, RotateCcw, Heart, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

import useSWR from "swr";
import { swrKeys } from "@/lib/swrKeys";
import { getProductOffers, getProductReviews } from "@/lib/api";

export default function ProductClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, setIsLoginModalOpen } = useAuth();
  const { success } = useToast();
  
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

  const { data: offers = [] } = useSWR(swrKeys.productOffers(product.id), () => getProductOffers(product.id));
  const { data: reviews = [] } = useSWR(swrKeys.productReviews(product.id), () => getProductReviews(product.id));

  return (
    <>
    <div className="min-h-screen bg-pp-surface">
      <main className="pp-container pb-10 pt-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/72 pp-shadow">
        
        <div className="flex items-center justify-between px-4 pt-4">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 hover:border-sky-100 hover:bg-[#edf4ff] hover:text-pp-primary"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
            Back
          </button>
          <nav className="hidden items-center gap-1.5 text-xs text-slate-500 opacity-80 sm:flex">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="text-slate-300">›</span>
            <Link href={`/category/${product.categoryId}`} className="truncate max-w-[150px] hover:text-blue-600">View Series</Link>
            <span className="text-slate-300">›</span>
            <span className="truncate max-w-[200px] font-medium text-slate-700">{product.name}</span>
          </nav>
        </div>

        <div className="flex flex-col gap-5 p-4 sm:gap-6 lg:flex-row">
          
          <div className="lg:w-[40%] flex flex-col gap-4">
            <div className="lg:sticky lg:top-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:max-h-[450px]">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`relative h-14 w-14 shrink-0 rounded-2xl border p-1 transition-all bg-white ${
                        selectedIndex === i ? "border-[#2874f0] shadow-sm" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Image src={img} alt={`${product.name} view ${i + 1}`} fill sizes="56px" className="object-contain" />
                    </button>
                  ))}
                </div>

                <div 
                  ref={imageRef}
                  className="relative order-1 aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-[1.8rem] border border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4 sm:order-2 sm:aspect-square"
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
                    priority 
                  />
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (!user) { setIsLoginModalOpen(true); return; }
                      toggleWishlist(product); 
                    }}
                    className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm transition-all ${
                      isInWishlist(product.id) ? "text-red-500" : "text-slate-300 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button 
                  onClick={handleAddToCart} 
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-sky-100 bg-[#edf4ff] py-4 text-sm font-bold text-pp-primary hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(9,22,43,0.12)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pp-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <ShoppingCart className="w-5 h-5" /> ADD TO CART
                </button>
                <button 
                  onClick={handleBuyNow} 
                  className="pp-button-primary flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-sm font-bold hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(22,68,163,0.35)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pp-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <Zap className="w-5 h-5" /> BUY NOW
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-[60%] flex flex-col gap-6">
            <div>
              <p className="text-pp-primary text-xs font-bold uppercase tracking-widest mb-1">{product.brand || "Pillipot"}</p>
              <h1 className="text-xl font-black leading-tight tracking-[-0.05em] text-slate-950 sm:text-2xl md:text-4xl">{product.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-pp-success text-white text-sm font-bold px-2.5 py-1 rounded-lg">
                {product.rating || 0} <Star className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="text-slate-500 text-sm">{(product.reviewsCount || 0).toLocaleString()} ratings & reviews</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-4xl">{formatPrice(product.price)}</span>
              {(product.discount ?? 0) > 0 && (
                <>
                  <span className="text-slate-400 line-through text-lg">{formatPrice(product.originalPrice || product.price)}</span>
                  <span className="text-pp-success text-base font-bold">Save {formatPrice((product.originalPrice || product.price) - product.price)}</span>
                </>
              )}
            </div>

            {offers.length > 0 && (
              <div className="rounded-[1.8rem] border border-white/60 bg-white/86 p-5 pp-shadow">
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-slate-900">Available Offers</h3>
                <ul className="space-y-2.5">
                  {offers.map((offer, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                      <Tag className="w-4 h-4 text-pp-primary shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{offer.title}</span>
                          {offer.minQuantity > 1 && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-pp-primary">
                              MIN QTY: {offer.minQuantity}
                            </span>
                          )}
                        </div>
                        {offer.description && <span className="text-xs text-slate-500 opacity-80">{offer.description}</span>}
                        {offer.code && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-widest text-pp-primary uppercase">Code: {offer.code}</span>
                            <button 
                              onClick={() => {
                                if (offer.code) {
                                  navigator.clipboard.writeText(offer.code);
                                  success("Code copied!");
                                }
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              COPY
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex flex-col items-center gap-2 rounded-[1.4rem] border border-white/60 bg-white/82 p-3 text-center pp-shadow md:p-4">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-pp-primary" />
                <span className="text-[9px] font-semibold text-slate-700 md:text-xs">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-[1.4rem] border border-white/60 bg-white/82 p-3 text-center pp-shadow md:p-4">
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-pp-primary" />
                <span className="text-[9px] font-semibold text-slate-700 md:text-xs">7 Day Returns</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-[1.4rem] border border-white/60 bg-white/82 p-3 text-center pp-shadow md:p-4">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-pp-primary" />
                <span className="text-[9px] font-semibold text-slate-700 md:text-xs">1 Year Warranty</span>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/60 bg-white/86 p-5 pp-shadow">
              <h3 className="mb-3 text-base font-black text-slate-950">Product Description</h3>
              <p className="text-sm leading-7 text-slate-600">{product.description}</p>
            </div>

            {product.videoUrl && (
              <div className="rounded-[1.8rem] border border-white/60 bg-white/86 p-5 pp-shadow">
                <h3 className="mb-3 flex items-center gap-2 text-base font-black text-slate-950">
                  <Play className="w-4 h-4 text-pp-primary" /> Product Video
                </h3>
                <div className="relative aspect-video overflow-hidden rounded-[1.4rem] bg-black/5">
                  <video controls className="w-full h-full">
                    <source src={product.videoUrl} />
                  </video>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="rounded-[1.8rem] border border-white/60 bg-white/86 p-8 pp-shadow">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-950">Customer Reviews</h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-pp-primary">{product.rating || 0}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= (product.rating || 0) ? "fill-pp-accent-warm text-pp-accent-warm" : "text-gray-100"}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No reviews yet</p>
                  <p className="text-xs text-slate-300 mt-2">Be the first to review this product after purchase!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 rounded-3xl bg-pp-surface border border-white/60">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pp-primary/10 flex items-center justify-center text-pp-primary font-black text-sm">
                            {review.customer?.customerName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-950">{review.customer?.customerName || "Anonymous"}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-pp-success/10 text-pp-success px-2 py-1 rounded-lg text-xs font-black">
                          {review.rating} <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
