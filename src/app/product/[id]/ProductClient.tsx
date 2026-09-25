"use client";

import { useState, useRef, useLayoutEffect, useEffect, useMemo, useCallback } from "react";
import { type Product } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import {
  LuStar,
  LuShoppingCart,
  LuZap,
  LuTag,
  LuTruck,
  LuRotateCcw,
  LuHeart,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuPlay,
  LuCalendarDays,
  LuClock,
  LuCheck,
  LuSparkles,
  LuPencil,
  LuTrash2,
  LuImage,
  LuType,
  LuMapPin,
  LuLoaderCircle,
  LuBanknote,
  LuUpload,
} from "react-icons/lu";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

import useSWR from "swr";
import { swrKeys } from "@/lib/swrKeys";
import { getProductOffers, getProductReviews, checkPincodeServiceability, uploadCustomPhotoApi, type PincodeServiceabilityResponse } from "@/lib/api";
import { cleanQuillHtml } from "@/lib/htmlUtils";

export default function ProductClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const isInCart = cart.some(item => item.id === product.id);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, setIsLoginModalOpen } = useAuth();
  const { success, error } = useToast();
  const isOutOfStock = product.stockQuantity <= 0;

  // Preparation days specified by seller (defaults to 2 if not set)
  const prepDays = Math.max(0, product.preparationDays !== undefined && product.preparationDays !== null ? Number(product.preparationDays) : 2);

  // Pincode Serviceability State
  const [pincodeInput, setPincodeInput] = useState<string>("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<PincodeServiceabilityResponse | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Delivery transit time in days from Delhivery API (standard courier transit is 3 days until live check)
  const deliveryDays = Number(pincodeResult?.tat || 3);
  const totalLeadDays = prepDays + deliveryDays;

  const formatYmd = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Earliest exact delivery date: Order Date (Today) + Preparation Days + Delhivery Delivery Days
  const getMinDeliveryDate = useCallback(() => {
    // If Delhivery API returned expectedDeliveryDate (calculated as order date + prepDays + Delhivery TAT)
    if (pincodeResult?.expectedDeliveryDate && /^\d{4}-\d{2}-\d{2}$/.test(pincodeResult.expectedDeliveryDate)) {
      const [y, m, d] = pincodeResult.expectedDeliveryDate.split("-").map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }

    // Default exact delivery date calculation: Today + prepDays + deliveryDays
    const d = new Date();
    d.setDate(d.getDate() + prepDays + deliveryDays);
    return d;
  }, [pincodeResult?.expectedDeliveryDate, prepDays, deliveryDays]);

  const minDateStr = useMemo(() => formatYmd(getMinDeliveryDate()), [getMinDeliveryDate]);

  const getMaxDeliveryDate = useCallback(() => {
    const d = getMinDeliveryDate();
    d.setDate(d.getDate() + 90);
    return d;
  }, [getMinDeliveryDate]);

  const maxDateStr = useMemo(() => formatYmd(getMaxDeliveryDate()), [getMaxDeliveryDate]);

  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string>(minDateStr);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Keep selected delivery date in sync whenever earliest delivery date updates (e.g. after Delhivery API response)
  useEffect(() => {
    setSelectedDeliveryDate((prev) => (!prev || prev < minDateStr ? minDateStr : prev));
  }, [minDateStr]);

  const formatDeliveryDisplay = (ymd: string) => {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return ymd;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const handleDateChange = (val: string) => {
    if (!val) return;
    if (val < minDateStr) {
      setSelectedDeliveryDate(minDateStr);
      return;
    }
    setSelectedDeliveryDate(val);
  };

  // Generate 3 quick date options starting from earliest delivery date
  const quickDateOptions = useMemo(() => {
    return [0, 1, 2].map((offset) => {
      const d = getMinDeliveryDate();
      d.setDate(d.getDate() + offset);
      const ymd = formatYmd(d);
      return {
        ymd,
        isEarliest: offset === 0,
        label: offset === 0 ? `Earliest: ${formatDeliveryDisplay(ymd)}` : formatDeliveryDisplay(ymd),
      };
    });
  }, [getMinDeliveryDate]);

  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("customer_delivery_pincode");
      if (savedPin && /^\d{6}$/.test(savedPin)) {
        setPincodeInput(savedPin);
        void checkPincodeServiceability(savedPin, product.id).then(res => setPincodeResult(res));
      }
    } catch { }
  }, [product.id]);

  // Global Header Pincode Sync: Auto-populate and auto-search on mount / product open
  useEffect(() => {
    try {
      const globalPin = localStorage.getItem("global_delivery_pincode");
      if (globalPin && /^\d{6}$/.test(globalPin.trim())) {
        const clean = globalPin.trim();
        setPincodeInput(clean);
        setIsCheckingPincode(true);
        checkPincodeServiceability(clean, product.id)
          .then((res) => {
            setPincodeResult(res);
            setPincodeError(null);
          })
          .catch(() => { })
          .finally(() => {
            setIsCheckingPincode(false);
          });
      }
    } catch { }
  }, [product.id]);

  // Listen to live global pincode changes from header
  useEffect(() => {
    const handleGlobalPinChange = (e: any) => {
      const pin = e.detail?.pincode;
      if (pin && /^\d{6}$/.test(pin)) {
        setPincodeInput(pin);
        setIsCheckingPincode(true);
        checkPincodeServiceability(pin, product.id)
          .then((res) => {
            setPincodeResult(res);
            setPincodeError(null);
          })
          .catch(() => { })
          .finally(() => {
            setIsCheckingPincode(false);
          });
      }
    };

    window.addEventListener("global_pincode_changed", handleGlobalPinChange);
    return () => window.removeEventListener("global_pincode_changed", handleGlobalPinChange);
  }, [product.id]);

  const handlePincodeCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pincodeInput.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeError("Please enter a valid 6-digit PIN code");
      setPincodeResult(null);
      return;
    }
    setPincodeError(null);
    setIsCheckingPincode(true);
    try {
      const res = await checkPincodeServiceability(clean, product.id);
      setPincodeResult(res);
      // NOTE: Do NOT alter global_delivery_pincode here, so editing another pincode on product page does not change the header PIN
    } catch {
      setPincodeError("Failed to check delivery serviceability. Please try again.");
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [canExpandDesc, setCanExpandDesc] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);

  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [canExpandTitle, setCanExpandTitle] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cleanedDescription = cleanQuillHtml(product.description);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const d = getMinDeliveryDate();
    setSelectedDeliveryDate(formatYmd(d));
  }, [product.id, prepDays]);

  useLayoutEffect(() => {
    const el = descRef.current || (typeof document !== "undefined" ? document.querySelector<HTMLDivElement>(".product-description-content") : null);
    if (el) {
      // Compare scrollHeight against clientHeight when collapsed to determine if content overflows
      const overflow = el.scrollHeight > el.clientHeight + 4;
      setCanExpandDesc(overflow);
    }
  }, [cleanedDescription]);

  useLayoutEffect(() => {
    if (titleRef.current) {
      const overflow = titleRef.current.scrollHeight > titleRef.current.clientHeight + 2;
      setCanExpandTitle(overflow);
    }
  }, [product.name]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHoverZoom, setIsHoverZoom] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setSelectedIndex((i) => (i + 1) % allImages.length);
    } else if (distance < -50) {
      setSelectedIndex((i) => (i - 1 + allImages.length) % allImages.length);
    }
  };

  const allImages = [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean) as string[];
  if (allImages.length === 0) {
    allImages.push(`data:image/svg+xml;base64,${btoa('<svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="800" fill="#F3F4FB"/><path d="M400 330V470M330 400H470" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round"/><circle cx="400" cy="400" r="100" stroke="#D1D5DB" stroke-width="4" stroke-dasharray="8 8"/><text x="400" y="550" text-anchor="middle" fill="#9CA3AF" font-family="sans-serif" font-size="20" font-weight="600" letter-spacing="0.1em">NO IMAGE AVAILABLE</text></svg>')}`);
  }

  const allowPhoto = product.allowPhotoUpload === true || String(product.allowPhotoUpload) === "true";
  const allowText = product.allowTextInput === true || String(product.allowTextInput) === "true";
  const isCustomizable = !!(allowPhoto || allowText);
  const promptText = product.customTextPrompt || "Enter custom text (name, quote, or message)";
  const maxTextLimit = product.customTextLimit || 50;

  const [customText, setCustomText] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [customizationError, setCustomizationError] = useState<string | null>(null);
  const customizationSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCustomizable) {
      setCustomText("");
      setCustomPhotoUrl("");
      setCustomNote("");
      try {
        localStorage.removeItem(`pillipot_customization_${product.id}`);
      } catch { }
      return;
    }
    try {
      const raw = localStorage.getItem(`pillipot_customization_${product.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.customText) setCustomText(parsed.customText);
        if (parsed.customPhotoUrl) setCustomPhotoUrl(parsed.customPhotoUrl);
        if (parsed.customNote) setCustomNote(parsed.customNote);
      }
    } catch { }
  }, [product.id, isCustomizable]);

  const saveCustomization = (text: string, photoUrl: string, note: string) => {
    try {
      if (text.trim() || photoUrl || note.trim()) {
        localStorage.setItem(`pillipot_customization_${product.id}`, JSON.stringify({
          productId: product.id,
          customText: text.trim() || undefined,
          customPhotoUrl: photoUrl || undefined,
          customNote: note.trim() || undefined,
          updatedAt: new Date().toISOString(),
        }));
      } else {
        localStorage.removeItem(`pillipot_customization_${product.id}`);
      }
    } catch { }
  };

  const handleTextChange = (val: string) => {
    setCustomText(val);
    if (customizationError) setCustomizationError(null);
    saveCustomization(val, customPhotoUrl, customNote);
  };

  const handleNoteChange = (val: string) => {
    setCustomNote(val);
    saveCustomization(customText, customPhotoUrl, val);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      error("Photo size must be less than 10MB");
      return;
    }

    setUploadingPhoto(true);
    setCustomizationError(null);
    try {
      const res = await uploadCustomPhotoApi(file);
      setCustomPhotoUrl(res.url);
      saveCustomization(customText, res.url, customNote);
      success("Photo uploaded successfully!");
    } catch (err: any) {
      error(err.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setCustomPhotoUrl("");
    saveCustomization(customText, "", customNote);
    success("Photo removed");
  };

  const hasCustomization = !!(
    (allowText ? customText.trim() : true) &&
    (allowPhoto ? customPhotoUrl : true) &&
    (customText.trim() || customPhotoUrl)
  );

  const isPersonalizationComplete = useMemo(() => {
    if (!isCustomizable) return true;
    if (allowText && !customText.trim()) return false;
    if (allowPhoto && !customPhotoUrl) return false;
    return true;
  }, [isCustomizable, allowText, allowPhoto, customText, customPhotoUrl]);

  const validateCustomization = (): boolean => {
    if (!isCustomizable) return true;
    if (uploadingPhoto) {
      error("Please wait for photo upload to finish.");
      return false;
    }
    if (allowText && !customText.trim()) {
      const msg = `Please enter ${product.customTextPrompt || "custom text"}.`;
      setCustomizationError(msg);
      error(msg);
      customizationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    if (allowPhoto && !customPhotoUrl) {
      const msg = "Please upload an image for your customization.";
      setCustomizationError(msg);
      error(msg);
      customizationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    setCustomizationError(null);
    return true;
  };

  const handleAddToCart = () => {
    if (!validateCustomization()) return;
    if (isInCart) {
      router.push("/cart");
      return;
    }
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    addToCart(
      product,
      1,
      selectedDeliveryDate,
      isCustomizable && customText.trim() ? customText.trim() : undefined,
      isCustomizable && customPhotoUrl ? customPhotoUrl : undefined
    );
  };

  const handleBuyNow = () => {
    if (!validateCustomization()) return;
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    const params = new URLSearchParams({
      buyNow: product.id,
      qty: "1",
      deliveryDate: selectedDeliveryDate,
    });
    if (isCustomizable && customText.trim()) {
      params.append("customText", customText.trim());
    }
    if (isCustomizable && customPhotoUrl) {
      params.append("customPhotoUrl", customPhotoUrl);
    }
    if (isCustomizable && customNote.trim()) {
      params.append("customNote", customNote.trim());
    }
    router.push(`/checkout?${params.toString()}`);
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

  const renderDescription = (isMobile = false) => (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
      <h3 className="text-xl font-black text-slate-950 mb-4">Product Description</h3>
      <div className="text-sm leading-6 text-slate-600">
        {cleanedDescription ? (
          <>
            <div
              ref={isMobile ? undefined : descRef}
              className={`product-description-content ${isDescExpanded ? "" : "max-h-[9rem] overflow-hidden relative"
                }`}
              dangerouslySetInnerHTML={{ __html: cleanedDescription }}
            />
            {canExpandDesc && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-3 font-bold text-pp-primary hover:underline focus:outline-none text-xs flex items-center gap-1"
              >
                {isDescExpanded ? "See Less" : "See More"}
              </button>
            )}
          </>
        ) : (
          <p className="text-slate-400 italic">No description available.</p>
        )}
      </div>

      {product.videoUrl && (
        <div className="mt-6">
          <h4 className="flex items-center gap-2 text-sm font-black text-slate-700 mb-3">
            <LuPlay className="w-4 h-4 text-pp-primary" /> Product Video
          </h4>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/5">
            <video controls className="w-full h-full">
              <source src={product.videoUrl} />
            </video>
          </div>
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-black text-slate-950">Customer Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-pp-primary">{product.rating || 0}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <LuStar key={s} className={`w-3.5 h-3.5 ${s <= (product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Reviews Yet</p>
          <p className="text-xs text-slate-300 mt-2">Be the first to review this product after purchase!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
            {reviews.slice(0, visibleReviewsCount).map((review) => {
              const initial = review.customer?.customerName?.charAt(0).toUpperCase() || "?";
              return (
                <div key={review.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-pp-primary/10 flex items-center justify-center text-pp-primary font-black text-sm shrink-0">
                        {initial}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-none">{review.customer?.customerName || "Anonymous"}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg shrink-0">
                      <span className="text-xs font-bold text-amber-700">{review.rating}</span>
                      <LuStar className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                </div>
              );
            })}
          </div>
          {reviews.length > visibleReviewsCount && (
            <button
              onClick={() => setVisibleReviewsCount((prev) => prev + 5)}
              className="w-full py-3 mt-4 text-pp-primary font-bold hover:bg-pp-primary/5 rounded-xl transition-colors text-sm"
            >
              Load More Reviews ({reviews.length - visibleReviewsCount}+)
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#f8f9fa]">
        <main className="pp-container max-sm:!px-4 max-sm:!pt-4 max-sm:!pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-12 sm:pt-6">

          {/* Breadcrumbs & Back */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-pp-primary font-bold text-sm hover:bg-pp-primary/5 px-4 py-2 rounded-full transition-colors border border-pp-primary/20"
            >
              <LuChevronLeft className="w-4 h-4" />
              Back
            </button>
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 opacity-80">
              <Link href="/" className="hover:text-pp-primary">Home</Link>
              <span className="text-slate-300">›</span>
              <Link href={`/category/${product.categoryId}`} className="truncate max-w-[150px] hover:text-pp-primary">View Series</Link>
              <span className="text-slate-300">›</span>
              <span className="truncate max-w-[200px] font-semibold text-slate-700">{product.name}</span>
            </nav>
          </div>

          {/* Product Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">

            {/* Left: Gallery, Description & Reviews */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {/* Thumbnail strip & Main image */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Thumbnail strip */}
                <div className="flex flex-row sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:max-h-[480px]">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`relative w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-white ${selectedIndex === i
                        ? "border-pp-primary shadow-md ring-2 ring-pp-primary/20 ring-offset-1"
                        : "border-slate-200 hover:border-pp-primary/50"
                        }`}
                    >
                      <Image src={img} alt={`${product.name} view ${i + 1}`} fill sizes="72px" className="object-cover" />
                    </button>
                  ))}
                </div>

                {/* Main image */}
                <div
                  ref={imageRef}
                  className="relative flex-1 aspect-square max-h-[380px] sm:max-h-[420px] rounded-[2rem] overflow-hidden bg-slate-100 cursor-zoom-in order-1 sm:order-2 group shadow-[0_10px_40px_-10px_rgba(43,127,255,0.15)]"
                  onMouseEnter={() => setIsHoverZoom(true)}
                  onMouseLeave={() => setIsHoverZoom(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => setZoomOpen(true)}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <Image
                    src={allImages[selectedIndex]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`object-cover transition-transform duration-500 ${isHoverZoom ? "scale-110" : "scale-100 group-hover:scale-105"}`}
                    style={isHoverZoom ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                    priority
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) { setIsLoginModalOpen(true); return; }
                      toggleWishlist(product);
                    }}
                    className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md border border-white/60 transition-all hover:scale-110 ${isInWishlist(product.id) ? "text-red-500" : "text-slate-300 hover:text-red-400"
                      }`}
                  >
                    <LuHeart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Desktop: Product Description & Customer Reviews under image */}
              <div className="hidden lg:flex flex-col gap-6">
                {renderDescription(false)}
                {renderReviews()}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="lg:col-span-6 flex flex-col gap-5 relative pb-4">

              {/* Brand & Title */}
              <div>
                <p className="text-pp-primary font-bold text-xs uppercase tracking-widest mb-1">{product.brand || "Pillipot"}</p>
                <div>
                  <h1
                    ref={titleRef}
                    className={`text-lg sm:text-2xl font-bold leading-snug text-slate-950 transition-all ${isTitleExpanded ? "" : "line-clamp-2"
                      }`}
                  >
                    {product.name}
                  </h1>
                  {canExpandTitle && (
                    <button
                      onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                      className="mt-1 text-xs font-bold text-pp-primary hover:underline inline-flex items-center gap-1 focus:outline-none"
                    >
                      {isTitleExpanded ? "See Less" : "See More"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mt-2.5">
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2.5 py-0.5 rounded-lg text-xs sm:text-sm font-bold">
                    {product.rating || 4.5} <LuStar className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                  <span className="text-slate-500 text-xs sm:text-sm font-medium">{(product.reviewsCount || 0).toLocaleString("en-IN")} ratings &amp; reviews</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-950">{formatPrice(product.price)}</span>
                {!!product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-slate-400 line-through text-lg font-medium">{formatPrice(product.originalPrice)}</span>
                    <span className="text-green-600 font-bold text-sm">{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF</span>
                  </>
                )}
              </div>

              {/* Out of Stock Notice */}
              {isOutOfStock && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 flex items-center gap-3 text-rose-800 text-xs sm:text-sm font-bold shadow-xs">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shrink-0 text-xs">✕</span>
                  <span>Currently Out of Stock. This product is temporarily unavailable for purchase.</span>
                </div>
              )}

              {/* Offers */}
              {offers.length > 0 && (
                <div className="rounded-2xl border border-pp-primary/10 bg-pp-primary/5 p-4">
                  <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-700">Available Offers</h3>
                  <ul className="space-y-2">
                    {offers.map((offer, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600">
                        <LuTag className="w-4 h-4 text-pp-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{offer.title}</span>
                            {offer.minQuantity > 1 && (
                              <span className="rounded-full bg-pp-primary/10 px-2 py-0.5 text-[10px] font-bold text-pp-primary">
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
                                className="text-[10px] font-bold text-pp-primary hover:underline"
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

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <LuTruck className="w-5 h-5 text-pp-primary" />
                  <span className="text-[10px] font-bold text-slate-700">Free Delivery</span>
                  <span className="text-[9px] text-slate-400 leading-tight">On eligible orders</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <LuRotateCcw className="w-5 h-5 text-pp-primary" />
                  <span className="text-[10px] font-bold text-slate-700">3 Day Returns</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Hassle-free swap</span>
                </div>
                <button
                  type="button"
                  onClick={() => datePickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className="flex flex-col items-center gap-1 rounded-xl border border-pp-primary/20 bg-pp-primary/5 p-3 text-center shadow-sm hover:border-pp-primary/40 hover:bg-pp-primary/10 transition-all cursor-pointer group"
                >
                  <LuCalendarDays className="w-5 h-5 text-pp-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-800">
                    {selectedDeliveryDate ? `Delivery: ${formatDeliveryDisplay(selectedDeliveryDate)}` : "Choose Date"}
                  </span>
                  <span className="text-[9px] text-pp-primary font-bold leading-tight">Click to change</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pp-primary/10 text-pp-primary">
                      <LuMapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Check Delivery to Your Area
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Enter your 6-digit PIN code to check serviceability & COD
                      </p>
                    </div>
                  </div>
                  {pincodeResult?.serviceable && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      ✓ Delivery Available
                    </span>
                  )}
                </div>

                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPincodeInput(val);
                        if (pincodeError) setPincodeError(null);
                      }}
                      placeholder="Enter 6-digit PIN (e.g. 682001)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-pp-primary focus:bg-white focus:ring-2 focus:ring-pp-primary/20 transition-all tracking-wider"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isCheckingPincode || pincodeInput.length !== 6}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-pp-primary disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    {isCheckingPincode ? (
                      <LuLoaderCircle className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      "Check"
                    )}
                  </button>
                </form>

                {/* Status: Error on left or Location on right */}
                {(pincodeError || (pincodeResult && !pincodeResult.serviceable) || (pincodeResult?.serviceable && (pincodeResult.city || pincodeResult.district || pincodeResult.state))) && (
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    {pincodeError ? (
                      <p className="font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠</span> {pincodeError}
                      </p>
                    ) : pincodeResult && !pincodeResult.serviceable ? (
                      <p className="font-semibold text-rose-600 flex items-center gap-1">
                        <span>✗</span> {pincodeResult.message || "Delivery is currently not available for this pincode."}
                      </p>
                    ) : (
                      <span />
                    )}

                    {pincodeResult?.serviceable && (pincodeResult.city || pincodeResult.district || pincodeResult.state) && (
                      <p className="ml-auto text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <LuMapPin className="w-3.5 h-3.5 text-pp-primary" />
                        <span>
                          {pincodeResult.city || pincodeResult.district ? `${pincodeResult.city || pincodeResult.district}, ` : ""}
                          {pincodeResult.state || ""}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Date Picker Section */}
              <div
                ref={datePickerRef}
                className="rounded-2xl border border-pp-primary/20 bg-gradient-to-br from-white via-white to-pp-primary/5 p-4 sm:p-5 shadow-sm space-y-3.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pp-primary/10 text-pp-primary shadow-sm">
                      <LuCalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Select Preferred Delivery Date
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">Choose when you would like to receive this order</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {prepDays > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800 shadow-sm">
                        <LuClock className="h-3 w-3" />
                        {prepDays} day{prepDays === 1 ? "" : "s"} preparation
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[10px] font-bold text-blue-800 shadow-sm">
                      <LuTruck className="h-3 w-3" />
                      +{deliveryDays} day{deliveryDays === 1 ? "" : "s"} delivery
                    </span>
                  </div>
                </div>

                {/* Quick Date Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick options</span>
                  <div className="grid grid-cols-3 gap-2">
                    {quickDateOptions.map((opt, idx) => {
                      const isSelected = selectedDeliveryDate === opt.ymd;
                      return (
                        <button
                          key={opt.ymd}
                          type="button"
                          onClick={() => setSelectedDeliveryDate(opt.ymd)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${isSelected
                            ? "border-pp-primary bg-pp-primary text-white shadow-md shadow-pp-primary/25 scale-[1.02]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-pp-primary/30 hover:bg-slate-50"
                            }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-white/80" : "text-pp-primary"}`}>
                            {opt.isEarliest ? "Earliest" : `+${idx} Day${idx > 1 ? "s" : ""}`}
                          </span>
                          <span className="text-xs sm:text-sm font-black mt-0.5">
                            {formatDeliveryDisplay(opt.ymd)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Input */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Or pick another date:
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={minDateStr}
                      max={maxDateStr}
                      value={selectedDeliveryDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 shadow-sm focus:border-pp-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-pp-primary/20 transition-all cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    * Dates before {formatDeliveryDisplay(minDateStr)} are disabled (Preparation: {prepDays}d + Delhivery: {deliveryDays}d).
                  </p>
                </div>

                {/* Selected Date Confirmation Banner */}
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 text-xs font-bold text-emerald-800">
                  <LuCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Delivery scheduled for <strong className="underline decoration-emerald-500/50 underline-offset-2">{formatDeliveryDisplay(selectedDeliveryDate || minDateStr)}</strong></span>
                </div>
              </div>

              {/* Delhivery Pincode Serviceability Checker */}


              {/* Inline Personalization Section */}
              {isCustomizable && (
                <div
                  ref={customizationSectionRef}
                  className="rounded-2xl border border-purple-200 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30 p-4 sm:p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 shadow-xs">
                        <LuSparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                          Personalize This Product
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {allowPhoto && allowText
                            ? "Upload your photo and enter custom text"
                            : allowPhoto
                              ? "Upload your custom photo for this item"
                              : "Enter your custom name or message"}
                        </p>
                      </div>
                    </div>

                    {isPersonalizationComplete && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        <LuCheck className="w-3 h-3 text-emerald-600" />
                        Customization Ready
                      </span>
                    )}
                  </div>

                  {/* Custom Text Input */}
                  {allowText && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <LuType className="w-3.5 h-3.5 text-purple-600" />
                          <span>{promptText}</span>
                          <span className="text-[10px] text-rose-500 font-semibold">*Required</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {customText.length}/{maxTextLimit}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={maxTextLimit}
                          value={customText}
                          onChange={(e) => handleTextChange(e.target.value)}
                          placeholder={product.customTextPrompt || "e.g. John & Sarah / Happy Birthday"}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                        />
                        {customText && (
                          <button
                            type="button"
                            onClick={() => handleTextChange("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <LuX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Photo Upload */}
                  {allowPhoto && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <LuImage className="w-3.5 h-3.5 text-purple-600" />
                          <span>Upload Custom Photo</span>
                          <span className="text-[10px] text-rose-500 font-semibold">*Required</span>
                        </label>
                        {customPhotoUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <LuCheck className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                          </span>
                        )}
                      </div>

                      {customPhotoUrl ? (
                        <div className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-purple-200 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                              <Image
                                src={customPhotoUrl}
                                alt="Customized photo"
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">Photo Ready</p>
                              <p className="text-[10px] text-slate-400">Attached to your order</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <label className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 cursor-pointer transition-colors">
                              <LuPencil className="w-3 h-3" /> Change
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                className="hidden"
                                disabled={uploadingPhoto}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors"
                            >
                              <LuTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${uploadingPhoto
                            ? "border-purple-300 bg-purple-50/50 cursor-wait"
                            : "border-purple-200/90 hover:border-purple-400 bg-purple-50/20 hover:bg-purple-50/40"
                          }`}>
                          {uploadingPhoto ? (
                            <div className="flex items-center gap-2 py-2 text-purple-700">
                              <LuLoaderCircle className="w-5 h-5 animate-spin text-purple-600" />
                              <span className="text-xs font-bold">Uploading photo, please wait...</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-1.5">
                                <LuUpload className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-slate-800">
                                Click to choose and upload photo
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                Supports JPG, PNG, WEBP (Max 10MB)
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            className="hidden"
                            disabled={uploadingPhoto}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Optional Special Instructions / Note */}
                  <div className="space-y-1.5 pt-1 border-t border-purple-100/60">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Special Instructions / Note <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={150}
                      value={customNote}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      placeholder="e.g. Gift wrap please, or placement request"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  </div>

                  {customizationError && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">
                      <span>⚠</span>
                      <span>{customizationError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons – desktop (Sticky fixed on screen on the right side) */}
              <div className="hidden sm:flex gap-3 sticky bottom-4 z-30 bg-white/95 backdrop-blur-xl p-3 rounded-2xl border border-slate-200/90 shadow-[0_12px_35px_rgba(18,52,104,0.14)]">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-pp-primary text-pp-primary px-5 py-3.5 font-bold hover:bg-pp-primary/5 active:scale-95 transition-all text-sm ${isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                >
                  <LuShoppingCart className="w-4 h-4" />
                  {isInCart ? "GO TO CART" : "ADD TO CART"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full ${isCustomizable && !isPersonalizationComplete
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pp-primary text-white shadow-purple-500/25"
                    : "bg-pp-primary text-white shadow-pp-primary/25"
                    } px-5 py-3.5 font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm ${isOutOfStock ? "opacity-50 grayscale cursor-not-allowed shadow-none" : "animate-attention"}`}
                >
                  {isOutOfStock ? (
                    <>OUT OF STOCK</>
                  ) : (
                    <>
                      <LuZap className="w-4 h-4" />
                      Buy at {formatPrice(product.price)}
                    </>
                  )}
                </button>
              </div>

              {/* Mobile: Product Description & Customer Reviews */}
              <div className="flex lg:hidden flex-col gap-6 mt-2">
                {renderDescription(true)}
                {renderReviews()}
              </div>
            </div>
          </div>

          {/* Mobile fixed action buttons */}
          <div className="flex gap-3 sm:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-sm p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] border-t border-slate-100">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-pp-primary text-pp-primary py-4 text-sm font-bold hover:bg-pp-primary/5 transition-all active:scale-95 ${isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
            >
              <LuShoppingCart className="w-5 h-5" /> {isInCart ? "GO TO CART" : "ADD TO CART"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full ${isCustomizable && !isPersonalizationComplete
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pp-primary text-white shadow-purple-500/20"
                : "bg-pp-primary text-white shadow-pp-primary/20"
                } py-4 text-sm font-bold shadow-lg transition-all active:scale-95 ${isOutOfStock ? "opacity-50 grayscale cursor-not-allowed shadow-none" : ""}`}
            >
              {isOutOfStock ? (
                <>OUT OF STOCK</>
              ) : (
                <>
                  <LuZap className="w-5 h-5" /> Buy at {formatPrice(product.price)}
                </>
              )}
            </button>
          </div>

        </main>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setZoomOpen(false)}>
          <button onClick={() => setZoomOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 z-10">
            <LuX className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-4 text-white/60 text-sm font-medium">
            {selectedIndex + 1} / {allImages.length}
          </div>
          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <LuChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <LuChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="relative w-[90vw] h-[80vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={allImages[selectedIndex]} alt={product.name} fill sizes="90vw" className="object-contain" />
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${selectedIndex === i ? "border-white shadow-lg" : "border-white/30 opacity-60 hover:opacity-100"}`}
                >
                  <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes attention-hop {
          0%, 90%, 100% { transform: translate(var(--tw-translate-x), 0px) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
          95% { transform: translate(var(--tw-translate-x), -4px) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
        }
        .animate-attention {
          animation: attention-hop 5s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
        }
      `}} />
    </>
  );
}
