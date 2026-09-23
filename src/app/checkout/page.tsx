"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LuCheck, LuShieldCheck, LuMapPin, LuCreditCard, LuBanknote, LuSmartphone, LuPlus, LuTrash2, LuHouse, LuBriefcase, LuLoaderCircle, LuPencilLine, LuPackage, LuX, LuHeart, LuArrowLeft, LuLeaf } from "react-icons/lu";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getAddresses, addAddress, autofillAddress, checkout, verifyPayment, failPayment, type CustomerAddress, deleteAddress, updateAddress, getProduct } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import useSWR from "swr";
import { swrKeys } from "@/lib/swrKeys";

type Step = "address" | "summary" | "payment";

function CheckoutContent() {
  const { cart: globalCart, cartTotal: globalCartTotal, cartMrpTotal: globalCartMrpTotal, cartCount: globalCartCount, clearCart, removeFromCart, loading: isCartLoading } = useCart();
  const { toggleWishlist } = useWishlist();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("buyNow");
  const buyNowQty = parseInt(searchParams.get("qty") || "1");
  const buyNowDeliveryDate = searchParams.get("deliveryDate") || undefined;
  const buyNowCustomText = searchParams.get("customText") || undefined;
  const buyNowCustomPhotoUrl = searchParams.get("customPhotoUrl") || undefined;
  const buyNowCustomNote = searchParams.get("customNote") || undefined;

  const [urlCart, setUrlCart] = useState<any[] | null>(null);
  const [isUrlCartLoading, setIsUrlCartLoading] = useState(false);

  useEffect(() => {
    const fetchBuyNowProduct = async () => {
      if (buyNowId) {
        setIsUrlCartLoading(true);
        try {
          const product = await getProduct(buyNowId);
          if (product) {
            setUrlCart([{
              ...product,
              cartQuantity: buyNowQty,
              deliveryDate: buyNowDeliveryDate,
              customText: buyNowCustomText,
              customPhotoUrl: buyNowCustomPhotoUrl,
              customNote: buyNowCustomNote,
            }]);
          }
        } catch (e) {
          console.error("Failed to fetch buy-now product");
        } finally {
          setIsUrlCartLoading(false);
        }
      }
    };
    fetchBuyNowProduct();
  }, [buyNowId, buyNowQty, buyNowDeliveryDate, buyNowCustomText, buyNowCustomPhotoUrl, buyNowCustomNote]);

  const cart = urlCart || globalCart;
  const [enrichedCart, setEnrichedCart] = useState<any[]>([]);

  // Enrichment: Fetch full product details for each cart item to get latest COD rules
  useEffect(() => {
    const enrich = async () => {
      if (cart.length > 0) {
        try {
          const enriched = await Promise.all(cart.map(async (item) => {
            // Aggressive check: if any known charge field exists and is > 0, we might skip
            const hasData = (item.codDeliveryCharge || item.cod_delivery_charge || item.codCharge || item.cod_charge);
            if (hasData && item.codDeliveryMilestones) return item;

            const fullProd = await getProduct(item.id);
            return fullProd ? {
              ...item,
              ...fullProd,
              deliveryDate: item.deliveryDate,
              customText: item.customText,
              customPhotoUrl: item.customPhotoUrl,
              customNote: item.customNote,
            } : item;
          }));
          setEnrichedCart(enriched);
        } catch (e) {
          console.error("Cart enrichment failed", e);
        }
      }
    };
    enrich();
  }, [cart]);

  const displayCart = enrichedCart.length > 0 ? enrichedCart : cart;

  const cartTotal = urlCart
    ? urlCart.reduce((acc, item) => acc + item.price * item.cartQuantity, 0)
    : globalCartTotal;
  const cartMrpTotal = urlCart
    ? urlCart.reduce((acc, item) => {
      const orig = Number(item.originalPrice);
      const price = Number(item.price);
      const mrp = orig > price ? orig : price;
      return acc + mrp * Number(item.cartQuantity);
    }, 0)
    : globalCartMrpTotal;
  const cartCount = urlCart
    ? urlCart.length
    : globalCartCount;

  const { error } = useToast();
  const { user, token } = useAuth();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<{ productId: string; discountPercentage: number; code: string } | null>(null);

  const [activeStep, setActiveStep] = useState<Step>("address");
  // Addresses are fetched + cached via SWR to avoid refetching on re-renders/navigation.
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "razorpay">("cod");
  const [editAddressId, setEditAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    pincode: "",
    postOffice: "",
    flatBuilding: "",
    areaSector: "",
    district: "",
    state: "",
    secondaryPhone: "",
    addressType: "home" as "home" | "work",
    isDefault: false,
    email: user?.username || "",
  });

  const formatPrice = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  // SWR: cache + dedupe address list fetches (prevents repeated calls on re-renders/nav).
  const {
    data: swrAddresses = [],
    isLoading: isAddressesLoading,
    mutate: mutateAddresses,
  } = useSWR(
    token ? swrKeys.addresses(token) : null,
    ([, t]) => getAddresses(t),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        // Initialize the selected address once, without a useEffect (avoid cascading renders).
        if (!selectedAddressId && data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
      },
    }
  );
  const addresses = swrAddresses;

  // Phone Autofill logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.phone.length === 10) {
        const data = await autofillAddress(formData.phone);
        if (data && data.email === user?.username) {
          // Split deliveryAddress like staff app
          const t = (data.deliveryAddress || "").trim();
          let flat = t;
          let area = "";
          const commaIndex = t.indexOf(",");
          if (commaIndex !== -1) {
            flat = t.slice(0, commaIndex).trim();
            area = t.slice(commaIndex + 1).trim();
          }

          setFormData(prev => ({
            ...prev,
            customerName: data.customerName || prev.customerName,
            pincode: data.pincode || prev.pincode,
            postOffice: data.postOffice || prev.postOffice,
            flatBuilding: flat || prev.flatBuilding,
            areaSector: area || prev.areaSector,
            district: data.district || prev.district,
            state: data.state || prev.state,
            secondaryPhone: data.secondaryPhone || prev.secondaryPhone,
          }));
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.phone]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Quick trigger for autofill if phone reaches 10 digits
    if (name === "phone" && value.length === 10) {
      void (async () => {
        const data = await autofillAddress(value);
        if (data && data.email === user?.username) {
          // Split deliveryAddress like staff app
          const t = (data.deliveryAddress || "").trim();
          let flat = t;
          let area = "";
          const commaIndex = t.indexOf(",");
          if (commaIndex !== -1) {
            flat = t.slice(0, commaIndex).trim();
            area = t.slice(commaIndex + 1).trim();
          }

          setFormData(prev => ({
            ...prev,
            customerName: data.customerName || prev.customerName,
            pincode: data.pincode || prev.pincode,
            postOffice: data.postOffice || prev.postOffice,
            flatBuilding: flat || prev.flatBuilding,
            areaSector: area || prev.areaSector,
            district: data.district || prev.district,
            state: data.state || prev.state,
            secondaryPhone: data.secondaryPhone || prev.secondaryPhone,
          }));
        }
      })();
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      // Guest flow - just save to summary
      setActiveStep("summary");
      return;
    }

    setIsLoading(true);
    const combinedAddress = `${formData.flatBuilding}${formData.areaSector ? ", " + formData.areaSector : ""}`;

    let res;
    if (editAddressId) {
      res = await updateAddress(token, editAddressId, {
        ...formData,
        deliveryAddress: combinedAddress
      } as any);
    } else {
      res = await addAddress(token, {
        ...formData,
        deliveryAddress: combinedAddress
      } as any);
    }

    if (res) {
      await mutateAddresses();
      setShowAddressForm(false);
      setEditAddressId(null);
      setSelectedAddressId(res.id);
      if (!editAddressId) {
        setActiveStep("summary");
      }
    }
    setIsLoading(false);
  };

  const handleEditClick = (addr: CustomerAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditAddressId(addr.id);

    // Split deliveryAddress like staff app
    const t = (addr.deliveryAddress || "").trim();
    let flat = t;
    let area = "";
    const commaIndex = t.indexOf(",");
    if (commaIndex !== -1) {
      flat = t.slice(0, commaIndex).trim();
      area = t.slice(commaIndex + 1).trim();
    }

    setFormData({
      customerName: addr.customerName,
      phone: addr.phone,
      pincode: addr.pincode,
      postOffice: addr.postOffice,
      flatBuilding: flat,
      areaSector: area,
      district: addr.district,
      state: addr.state,
      secondaryPhone: addr.secondaryPhone || "",
      addressType: addr.addressType as any,
      isDefault: addr.isDefault,
      email: user?.username || addr.email || "",
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (token) {
      await deleteAddress(token, id);
      void mutateAddresses();
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    let checkoutInfo;
    if (selectedAddressId) {
      const selectedAddr = addresses.find(a => a.id === selectedAddressId);
      if (selectedAddr) {
        checkoutInfo = {
          customerName: selectedAddr.customerName,
          deliveryAddress: selectedAddr.deliveryAddress,
          phone: selectedAddr.phone,
          pincode: selectedAddr.pincode,
          postOffice: selectedAddr.postOffice,
          email: selectedAddr.email,
          state: selectedAddr.state,
          district: selectedAddr.district,
          secondaryPhone: selectedAddr.secondaryPhone
        };
      }
    } else {
      const combinedAddress = `${formData.flatBuilding}${formData.areaSector ? ", " + formData.areaSector : ""}`;
      checkoutInfo = {
        ...formData,
        deliveryAddress: combinedAddress
      };
    }

    if (!checkoutInfo) {
      error("Please provide an address");
      setIsPlacingOrder(false);
      return;
    }

    try {
      const res = await checkout(cart, { ...checkoutInfo, paymentMethod: selectedPayment }, appliedOffer);

      if (res.paymentMethod === "razorpay" && res.razorpayOrderId) {
        // Load Razorpay script if not loaded
        if (!(window as any).Razorpay) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load Razorpay"));
            document.head.appendChild(s);
          });
        }

        const options = {
          key: res.razorpayKeyId,
          amount: res.razorpayAmount,
          currency: res.currency || "INR",
          name: "Pillipot",
          description: `Order ${res.orderId}`,
          order_id: res.razorpayOrderId,
          handler: async (response: any) => {
            try {
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: res.orderId,
              });
              clearCart();
              router.push(`/order-success?orderId=${res.orderId}&paid=true`);
            } catch (verifyErr: any) {
              error(verifyErr.message || "Payment verification failed");
            }
            setIsPlacingOrder(false);
          },
          modal: {
            ondismiss: () => {
              setIsPlacingOrder(false);
            },
          },
          prefill: {
            name: checkoutInfo.customerName,
            email: checkoutInfo.email,
            contact: checkoutInfo.phone,
          },
          theme: { color: "#2172FF" },
        };

        const rzp = new (window as any).Razorpay(options);

        rzp.on("payment.failed", async (response: any) => {
          try {
            await failPayment({
              razorpay_order_id: response.error.metadata.order_id,
              razorpay_payment_id: response.error.metadata.payment_id,
              errorCode: response.error.code,
              errorDescription: response.error.description,
            });
          } catch (err) {
            console.error("Failed to notify backend of payment failure:", err);
          }
          error(response.error.description || "Payment failed");
        });

        rzp.open();
        return; // Don't setIsPlacingOrder(false) — Razorpay modal is open
      }

      // COD flow
      clearCart();
      router.push(`/order-success?orderId=${res.orderId}`);
    } catch (err: any) {
      error(err.message || "Something went wrong. Please try again.");
    }
    setIsPlacingOrder(false);
  };

  // Clear applied offer if product is removed from cart
  useEffect(() => {
    if (appliedOffer && !cart.some(item => item.id === appliedOffer.productId)) {
      setAppliedOffer(null);
    }
  }, [cart, appliedOffer]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsLoading(true);
    let codeApplied = false;

    try {
      const { getProductOffers } = await import("@/lib/api");

      // Check each product in cart
      for (const item of cart) {
        const offers = await getProductOffers(item.id);
        const matchingOffer = offers.find(o =>
          o.isActive &&
          o.code?.toLowerCase() === promoCode.toLowerCase().trim()
        );

        if (matchingOffer) {
          if (item.cartQuantity < matchingOffer.minQuantity) {
            error(`This code requires at least ${matchingOffer.minQuantity} units of ${item.name}`);
            setIsLoading(false);
            return;
          }

          setAppliedOffer({
            productId: item.id,
            discountPercentage: Number(matchingOffer.discountPercentage),
            code: matchingOffer.code || promoCode
          });
          codeApplied = true;
          // toast success would be nice, but we have error toast here. 
          // Assuming we have a way to show success or just the state change is enough.
          break;
        }
      }

      if (!codeApplied) {
        error("Invalid promo code or code not applicable to items in cart.");
      }
    } catch (err) {
      error("Failed to validate promo code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    // If URL cart was being used, we should probably update it too or clear it
    if (urlCart) {
      setUrlCart(prev => prev ? prev.filter(i => i.id !== productId) : null);
    }
  };

  const handleSaveForLater = (product: any) => {
    toggleWishlist(product);
    removeFromCart(product.id);
    if (urlCart) {
      setUrlCart(prev => prev ? prev.filter(i => i.id !== product.id) : null);
    }
  };

  const offerProduct = appliedOffer ? cart.find(i => i.id === appliedOffer.productId) : null;
  const offerDiscount = offerProduct
    ? Math.round(offerProduct.price * (appliedOffer!.discountPercentage / 100) * offerProduct.cartQuantity)
    : 0;

  const codDeliveryFee = displayCart.length > 0
    ? Math.max(0, ...displayCart.map((item: any) => {
        // Aggressive fallback for various backend naming conventions
        let charge = Number(
          item.cod_delivery_charge ?? 
          item.codDeliveryCharge ?? 
          item.cod_charge ?? 
          item.codCharge ?? 
          item.delivery_charge ??
          item.deliveryCharge ??
          0
        );
        
        let milestones = 
          item.cod_delivery_milestones || 
          item.codDeliveryMilestones || 
          item.quantity_based_rules ||
          item.cod_rules ||
          item.codRules;

        // Support string format from admin: "1:80, 3:59"
        if (typeof milestones === "string" && milestones.trim() !== "") {
          try {
            const rules = milestones.split(",").map((r: string) => {
              const parts = r.split(":").map(s => s.trim());
              if (parts.length === 2) {
                const [q, c] = parts.map(s => parseInt(s));
                return { quantity: q, charge: c };
              }
              return null;
            }).filter((r: any) => r !== null && !isNaN(r.quantity) && !isNaN(r.charge));
            milestones = rules;
          } catch (e) {
            console.error("Failed to parse milestones string", e);
          }
        }

        if (Array.isArray(milestones) && milestones.length > 0) {
          const sorted = [...milestones].sort((a, b) => b.quantity - a.quantity);
          const matching = sorted.find((m) => item.cartQuantity >= m.quantity);
          if (matching) {
            charge = Number(matching.charge);
          }
        }
        return charge;
      }))
    : 0;
  
  const deliveryFee = selectedPayment === "cod" ? codDeliveryFee : 0;

  const finalTotal = cartTotal - offerDiscount + deliveryFee;

  // On address/review steps, show total without delivery fee (only add it on payment step)
  const displayTotal = activeStep === "payment" ? finalTotal : cartTotal - offerDiscount;

  const selectedAddrObj = addresses.find(a => a.id === selectedAddressId) || {
    customerName: formData.customerName,
    deliveryAddress: `${formData.flatBuilding}${formData.areaSector ? ", " + formData.areaSector : ""}`,
    district: formData.district,
    state: formData.state,
    pincode: formData.pincode
  };

  const steps = [
    { key: "address", label: "Address", num: 1 },
    { key: "summary", label: "Review", num: 2 },
    { key: "payment", label: "Payment", num: 3 },
  ];

  return (
    <main className="flex-1 pp-container py-6">
      {/* Progress Stepper - Perfectly Centered */}
      <div className="flex flex-col items-center mb-16 px-4">
        <div className="flex items-center justify-between w-full max-w-2xl relative">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200 z-0"></div>
          {/* Active Progress Line */}
          <div 
            className="absolute top-5 left-0 h-[2px] bg-pp-primary transition-all duration-500 z-0 shadow-[0_0_8px_rgba(43,127,255,0.3)]"
            style={{ width: activeStep === "address" ? "0%" : activeStep === "summary" ? "50%" : "100%" }}
          ></div>
          
          {steps.map((step, i) => {
            const isActive = steps.findIndex(s => s.key === activeStep) >= i;
            const isCompleted = steps.findIndex(s => s.key === activeStep) > i;
            
            return (
              <div key={step.key} className="flex flex-col items-center gap-3 relative z-10 bg-[#f8f9fa] px-4">
                <div className={`relative z-20 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-all duration-300 ${
                  isActive 
                    ? "bg-pp-primary text-white ring-4 ring-pp-primary/10" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {isCompleted ? <LuCheck className="w-5 h-5" /> : step.num}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  isActive ? "text-pp-primary" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          {activeStep === "address" && (
            <div className="space-y-4">
              {/* Saved Addresses */}
              {!showAddressForm && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <LuMapPin className="w-6 h-6 text-pp-primary" />
                      Select Delivery Address
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address Shimmer Effect */}
                    {isAddressesLoading && addresses.length === 0 ? (
                      <>
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="h-5 bg-gray-100 animate-shimmer rounded-full w-24" />
                              <div className="h-4 bg-gray-100 animate-shimmer rounded w-16" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-6 bg-gray-100 animate-shimmer rounded w-3/4" />
                              <div className="h-4 bg-gray-100 animate-shimmer rounded w-full" />
                              <div className="h-4 bg-gray-100 animate-shimmer rounded w-5/6" />
                            </div>
                            <div className="pt-4 border-t border-gray-50 flex gap-2">
                              <div className="h-4 bg-gray-100 animate-shimmer rounded w-4" />
                              <div className="h-4 bg-gray-100 animate-shimmer rounded w-24" />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col h-full bg-white ${selectedAddressId === addr.id
                            ? "border-pp-primary shadow-lg ring-4 ring-pp-primary/5"
                            : "border-gray-100 hover:border-pp-primary/30 hover:shadow-md"
                            }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedAddressId === addr.id ? "border-pp-primary" : "border-gray-300 group-hover:border-gray-400"}`}>
                                {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-pp-primary animate-in zoom-in duration-300" />}
                              </div>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${addr.addressType === 'home' ? "bg-pp-cyan/10 text-pp-cyan" : "bg-pp-accent-warm/10 text-pp-accent-warm"
                                }`}>
                                {addr.addressType}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] px-2.5 py-0.5 bg-pp-primary/10 text-pp-primary rounded-full font-bold uppercase tracking-wider">Default</span>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleEditClick(addr, e)}
                                className="text-gray-400 hover:text-pp-primary p-1.5 hover:bg-pp-surface-alt rounded-lg transition-all"
                                title="Edit"
                              >
                                <LuPencilLine className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <LuTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 text-left space-y-1">
                            <h3 className="font-extrabold text-gray-900 text-base">{addr.customerName}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{addr.deliveryAddress}</p>
                            <p className="text-sm text-gray-500 font-medium">{addr.postOffice}, {addr.district}, {addr.state} — {addr.pincode}</p>
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
                              <LuSmartphone className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-sm text-gray-900 font-bold">{addr.phone}</p>
                            </div>
                          </div>

                          {selectedAddressId === addr.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveStep("summary");
                                window.scrollTo(0, 0);
                              }}
                              disabled={cartCount === 0}
                              className="mt-5 pp-gradient text-white w-full py-3 rounded-xl font-black text-sm shadow-pp hover:brightness-110 transition-all animate-in slide-in-from-bottom-2 duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                            >
                              DELIVER TO THIS ADDRESS
                            </button>
                          )}
                        </div>
                      ))
                    )}

                    {/* Add New Address Card */}
                    <div
                      onClick={() => setShowAddressForm(true)}
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-pp-primary hover:bg-pp-surface-alt transition-all min-h-[220px] group bg-white/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-pp-surface-alt text-pp-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <LuPlus className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="font-bold text-gray-900 block">Add New Address</span>
                        <span className="text-xs text-gray-500 mt-1 block">Specify a new delivery location</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Form (Add New or Initial for Guest) */}
              {(showAddressForm || (addresses.length === 0 && !isAddressesLoading)) && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-pp-primary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pp-primary/10 flex items-center justify-center">
                        <LuMapPin className="w-5 h-5 text-pp-primary" />
                      </div>
                      <div>
                        <h2 className="font-black text-gray-900 text-lg">{editAddressId ? "Edit Address" : (addresses.length > 0 ? "Add New Address" : "Delivery Address")}</h2>
                        <p className="text-xs text-gray-500">Please provide accurate delivery details</p>
                      </div>
                    </div>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => { setShowAddressForm(false); setEditAddressId(null); }}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        <LuX className="w-5 h-5" />
                        <span className="sr-only">Cancel</span>
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleAddAddress} className="p-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required maxLength={10} autoFocus placeholder="10-digit mobile number" />
                        <InputField label="Full Name" name="customerName" value={formData.customerName} onChange={handleInputChange} required placeholder="Receiver's name" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Alternate Phone (Optional)" name="secondaryPhone" value={formData.secondaryPhone} onChange={handleInputChange} placeholder="Additional number" />
                        <InputField label="Email Address" name="email" value={formData.email} onChange={handleInputChange} readOnly placeholder="Linked to account" />
                      </div>

                      <div className="pt-4 border-t border-gray-50">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Address Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField label="Flat / House / Building *" name="flatBuilding" value={formData.flatBuilding} onChange={handleInputChange} required placeholder="Building name/number" />
                          <InputField label="Area / Sector / Locality *" name="areaSector" value={formData.areaSector} onChange={handleInputChange} required placeholder="Street/Landmark" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InputField label="Pincode *" name="pincode" value={formData.pincode} onChange={handleInputChange} required maxLength={6} placeholder="6 digits" />
                        <InputField label="Post Office *" name="postOffice" value={formData.postOffice} onChange={handleInputChange} required />
                        <InputField label="District *" name="district" value={formData.district} onChange={handleInputChange} required />
                        <InputField label="State *" name="state" value={formData.state} onChange={handleInputChange} required />
                      </div>

                      <div className="pt-6 flex flex-col lg:flex-row gap-6 items-center justify-between border-t border-gray-50">
                        <div className="flex flex-col gap-3 w-full lg:w-auto">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center lg:text-left">Address Type</span>
                          <div className="flex gap-3">
                            {(["home", "work"] as const).map((type) => (
                              <label key={type} className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.addressType === type ? "border-pp-primary bg-pp-surface-alt text-pp-primary shadow-sm" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}>
                                <input type="radio" name="addressType" value={type} checked={formData.addressType === type} onChange={() => setFormData(p => ({ ...p, addressType: type }))} className="hidden" />
                                {type === "home" ? <LuHouse className="w-5 h-5" /> : <LuBriefcase className="w-5 h-5" />}
                                <span className="text-sm font-bold capitalize">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto mt-4 lg:mt-0 pt-6 lg:pt-0">
                          <button type="submit" className="pp-gradient text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:shadow-pp-primary/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                            {editAddressId ? "SAVE CHANGES" : "SAVE & DELIVER HERE"}
                          </button>
                          {addresses.length > 0 && (
                            <button type="button" onClick={() => { setShowAddressForm(false); setEditAddressId(null); }} className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all w-full sm:w-auto">
                              CANCEL
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeStep === "summary" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left">
                {/* Review Header */}
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-jakarta font-extrabold text-gray-900">Review Your Order</h2>
                  <p className="text-sm text-gray-500 mt-1">Double check your details before we finalize your package.</p>
                </div>

                {/* Delivering To Section */}
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Delivering To</h3>
                    <button 
                      onClick={() => setActiveStep("address")}
                      className="text-pp-primary font-bold text-xs hover:underline uppercase tracking-wider"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="bg-pp-primary/10 p-3 rounded-xl text-pp-primary">
                      <LuMapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedAddrObj.customerName}</p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                        {selectedAddrObj.deliveryAddress}, {selectedAddrObj.district}, {selectedAddrObj.state} — {selectedAddrObj.pincode}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-gray-500">
                        <LuSmartphone className="w-3.5 h-3.5" />
                        <p className="text-xs font-medium">{formData.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product List */}
                <div className="p-6 space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Items in Order ({cartCount})</h3>
                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => (
                      <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex gap-6 items-center group">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 shrink-0 group-hover:scale-105 transition-transform duration-300">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-cover" unoptimized />
                          ) : (
                            <LuPackage className="w-8 h-8 text-gray-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-pp-primary transition-colors">{item.name}</h4>
                            <p className="text-lg font-black text-gray-900">{formatPrice(item.price * item.cartQuantity)}</p>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">Qty: {item.cartQuantity} | <span className="text-pp-success font-bold text-[10px] uppercase tracking-wider">In Stock</span></p>
                          {item.deliveryDate && (
                            <p className="text-xs font-bold text-pp-primary mt-1">
                              📅 Delivery date: {item.deliveryDate}
                            </p>
                          )}
                          {(item.customText || item.customPhotoUrl || item.customNote) && (
                            <div className="mt-2 space-y-1.5 p-2 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 font-medium w-fit max-w-full">
                              <div className="flex items-center gap-2">
                                {item.customPhotoUrl && (
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-purple-200">
                                    <Image src={item.customPhotoUrl} alt="Custom Photo" fill sizes="32px" className="object-cover" />
                                  </div>
                                )}
                                {item.customText && (
                                  <span className="truncate">Personalized: &ldquo;{item.customText}&rdquo;</span>
                                )}
                              </div>
                              {item.customNote && (
                                <p className="text-[11px] text-purple-700 italic border-t border-purple-100 pt-1">
                                  Note: &ldquo;{item.customNote}&rdquo;
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-4 mt-4">
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-500 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <LuTrash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                            <button 
                              onClick={() => handleSaveForLater(item)}
                              className="text-gray-400 hover:text-pp-primary text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <LuHeart className="w-3.5 h-3.5" /> Save for later
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={() => {
                      if (cartCount === 0) {
                        router.push("/");
                      } else {
                        setActiveStep("address");
                        window.scrollTo(0, 0);
                      }
                    }}
                    className="flex items-center gap-2 text-slate-500 hover:text-pp-primary font-bold transition-colors group"
                  >
                    <LuArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {cartCount === 0 ? "Return to Shop" : "Back to Shipping"}
                  </button>
                  <button
                    onClick={() => { setActiveStep("payment"); window.scrollTo(0, 0); }}
                    disabled={cartCount === 0}
                    className="w-full sm:w-auto px-6 py-3 sm:px-12 sm:py-3.5 bg-pp-primary text-white font-black rounded-xl shadow-lg shadow-pp-primary/20 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm uppercase tracking-widest disabled:opacity-50 disabled:grayscale disabled:scale-100"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeStep === "payment" && (
            <div className="bg-white rounded-2xl border border-gray-100 pp-shadow overflow-hidden text-left">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="p-5 space-y-3">
                {/* COD Option */}
                <div
                  onClick={() => setSelectedPayment("cod")}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${selectedPayment === "cod"
                    ? "border-pp-primary bg-pp-surface-alt"
                    : "border-gray-200 hover:border-pp-primary/30"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <input type="radio" name="payment" id="cod" className="w-4 h-4 accent-pp-primary mt-1" checked={selectedPayment === "cod"} onChange={() => setSelectedPayment("cod")} />
                    <div className="flex flex-col gap-1 flex-1">
                      <label htmlFor="cod" className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-2">
                        <LuBanknote className="w-4 h-4 text-pp-primary" />
                        Cash on Delivery
                      </label>
                      <span className="text-xs text-pp-success font-semibold">Pay when you receive</span>
                    </div>
                  </div>
                </div>

                {/* Razorpay Online Payment Option */}
                <div
                  onClick={() => setSelectedPayment("razorpay")}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${selectedPayment === "razorpay"
                    ? "border-pp-primary bg-pp-surface-alt"
                    : "border-gray-200 hover:border-pp-primary/30"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <input type="radio" name="payment" id="razorpay" className="w-4 h-4 accent-pp-primary mt-1" checked={selectedPayment === "razorpay"} onChange={() => setSelectedPayment("razorpay")} />
                    <div className="flex flex-col gap-1 flex-1">
                      <label htmlFor="razorpay" className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-2">
                        <LuCreditCard className="w-4 h-4 text-pp-primary" />
                        Pay Online
                      </label>
                      <span className="text-xs text-gray-500">UPI, Credit/Debit Card, Net Banking, Wallets</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 bg-pp-success/10 text-pp-success rounded font-bold">Powered by Razorpay</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cartCount === 0}
                  className="mt-4 pp-gradient text-white px-12 py-3.5 rounded-xl font-black shadow-lg hover:shadow-xl transition-all w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {isPlacingOrder ? (
                    <>
                      <LuLoaderCircle className="w-5 h-5 animate-spin" />
                      {selectedPayment === "razorpay" ? "PROCESSING..." : "PLACING ORDER..."}
                    </>
                  ) : (
                    selectedPayment === "razorpay"
                      ? `PAY ${formatPrice(finalTotal)} ONLINE`
                      : `CONFIRM ORDER — ${formatPrice(finalTotal)}`
                  )}
                </button>
              </div>
              <div className="p-5 bg-gray-50/50 flex items-center gap-2 text-gray-400 justify-center">
                <LuShieldCheck className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">100% Secure & Encrypted Payments</span>
              </div>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[380px] space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Summary</h3>
            </div>
            
            {/* Loading State for Buy Now */}
            {(isCartLoading || isUrlCartLoading) && cart.length === 0 ? (
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 animate-shimmer rounded w-24" />
                  <div className="h-4 bg-gray-100 animate-shimmer rounded w-16" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 animate-shimmer rounded w-16" />
                  <div className="h-4 bg-gray-100 animate-shimmer rounded w-12" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 animate-shimmer rounded w-28" />
                  <div className="h-4 bg-gray-100 animate-shimmer rounded w-10" />
                </div>
                <div className="border-t border-dashed border-gray-100 pt-5 mt-4">
                  <div className="flex justify-between items-end">
                    <div className="h-6 bg-gray-100 animate-shimmer rounded w-20" />
                    <div className="h-8 bg-gray-100 animate-shimmer rounded w-24" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between font-medium text-sm text-gray-500">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-bold text-gray-900">{formatPrice(cartMrpTotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-sm text-gray-500">
                    <span>Shipping</span>
                    {activeStep === "payment" && deliveryFee > 0 ? (
                      <span className="font-bold text-gray-900">{formatPrice(deliveryFee)}</span>
                    ) : (
                      <span className="text-pp-success font-bold uppercase tracking-wider">Free</span>
                    )}
                  </div>
                  <div className="flex justify-between font-medium text-sm text-gray-500">
                    <span>Estimated Tax</span>
                    <span className="font-bold text-gray-900">{formatPrice(0)}</span>
                  </div>
                  
                  {cartMrpTotal > cartTotal && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Discount</span>
                      <span className="font-bold text-pp-success">-{formatPrice(cartMrpTotal - cartTotal)}</span>
                    </div>
                  )}

                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-sm text-gray-500 animate-in fade-in duration-300">
                      <div className="flex flex-col">
                        <span>Offer Discount</span>
                        <span className="text-[10px] text-pp-primary font-bold uppercase tracking-wider">Code: {appliedOffer?.code}</span>
                      </div>
                      <span className="font-bold text-pp-success">-{formatPrice(offerDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-slate-200 pt-5 mt-6">
                    <div className="flex justify-between items-end">
                      <span className="text-xl font-black font-sora text-slate-900">Total</span>
                      <div className="text-right">
                        <div className="text-2xl font-black text-pp-primary">
                          {formatPrice(displayTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4 border-t border-gray-50">
                  <div className="space-y-2 mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Promo Code</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-pp-primary/10 outline-none placeholder:text-gray-300 transition-all"
                      />
                      <button 
                        onClick={() => {
                          if (promoCode === "SAVE10") {
                            setAppliedOffer({ productId: "all", discountPercentage: 10, code: "SAVE10" });
                            setPromoCode("");
                          }
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex gap-3 items-center">
                    <LuLeaf className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-[10px] font-bold text-green-700 leading-tight">
                      Your order qualifies for carbon-neutral shipping at no extra cost!
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Buyer Protection Card */}
          <div className="bg-pp-primary/5 rounded-2xl p-6 border border-pp-primary/10">
            <div className="flex items-center gap-3 mb-3 text-pp-primary">
              <LuShieldCheck className="w-6 h-6" />
              <h4 className="font-bold text-sm">Buyer Protection</h4>
            </div>
            <p className="text-xs text-pp-primary/70 leading-relaxed font-medium">
              Get a full refund if the item is not as described.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><LuLoaderCircle className="w-10 h-10 animate-spin text-pp-primary" /></div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}

function InputField({ label, name, value, onChange, required = false, maxLength, autoFocus, placeholder, readOnly }: any) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1 transition-colors group-focus-within:text-pp-primary">
        {label}
        {required && <span className="text-pp-accent ml-0.5">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        autoFocus={autoFocus}
        readOnly={readOnly}
        placeholder={placeholder || label}
        className={`border-2 rounded-2xl p-4 outline-none transition-all text-sm w-full font-medium ${readOnly
          ? "bg-gray-50 cursor-not-allowed text-gray-400 border-gray-100"
          : "bg-white border-gray-100 focus:border-pp-primary focus:shadow-lg focus:shadow-pp-primary/5 hover:border-gray-200"
          }`}
      />
    </div>
  );
}

