"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, MapPin, CreditCard, Banknote, Smartphone, Plus, Trash2, Home, Briefcase, Loader2, PencilLine, Package, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getAddresses, addAddress, autofillAddress, checkout, type CustomerAddress, deleteAddress, setDefaultAddress, updateAddress } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

type Step = "address" | "summary" | "payment";

export default function CheckoutPage() {
  const { cart, cartTotal, cartMrpTotal, cartCount, clearCart } = useCart();
  const { error } = useToast();
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [activeStep, setActiveStep] = useState<Step>("address");
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
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

  // Fetch addresses if logged in
  useEffect(() => {
    if (user && token) {
      loadAddresses();
    }
  }, [user, token]);

  const loadAddresses = async () => {
    setIsLoading(true);
    const data = await getAddresses(token!);
    setAddresses(data);
    const defaultAddr = data.find(a => a.isDefault) || data[0];
    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    setIsLoading(false);
  };
  
  // Set email from logged-in user
  useEffect(() => {
    if (user?.username) {
      setFormData(prev => ({ ...prev, email: user.username }));
    }
  }, [user]);

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
      await loadAddresses();
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
      loadAddresses();
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
      const res = await checkout(cart, checkoutInfo);
      clearCart();
      router.push(`/order-success?orderId=${res.orderId}`);
    } catch (err: any) {
      error(err.message || "Something went wrong. Please try again.");
    }
    setIsPlacingOrder(false);
  };

  const selectedAddrObj = addresses.find(a => a.id === selectedAddressId) || {
    customerName: formData.customerName,
    deliveryAddress: `${formData.flatBuilding}${formData.areaSector ? ", " + formData.areaSector : ""}`,
    district: formData.district,
    state: formData.state
  };

  const steps = [
    { key: "address", label: "Address", num: 1 },
    { key: "summary", label: "Review", num: 2 },
    { key: "payment", label: "Payment", num: 3 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-pp-surface">
      <Header />

      <main className="flex-1 pp-container py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  steps.findIndex(s => s.key === activeStep) >= i
                    ? "pp-gradient text-white shadow-md"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {steps.findIndex(s => s.key === activeStep) > i ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className={`text-sm font-semibold hidden sm:block ${
                  steps.findIndex(s => s.key === activeStep) >= i ? "text-pp-primary" : "text-gray-400"
                }`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 rounded-full ${
                  steps.findIndex(s => s.key === activeStep) > i ? "bg-pp-primary" : "bg-gray-200"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            {activeStep === "address" && (
              <div className="space-y-4">
                {/* Saved Addresses */}
                {addresses.length > 0 && !showAddressForm && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-pp-primary" />
                        Select Delivery Address
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col h-full bg-white ${
                            selectedAddressId === addr.id 
                              ? "border-pp-primary shadow-lg ring-4 ring-pp-primary/5" 
                              : "border-gray-100 hover:border-pp-primary/30 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedAddressId === addr.id ? "border-pp-primary" : "border-gray-300 group-hover:border-gray-400"}`}>
                                {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-pp-primary animate-in zoom-in duration-300" />}
                              </div>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                addr.addressType === 'home' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
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
                                className="text-gray-400 hover:text-pp-primary p-1.5 hover:bg-violet-50 rounded-lg transition-all"
                                title="Edit"
                              >
                                <PencilLine className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteAddress(addr.id, e)} 
                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex-1 text-left space-y-1">
                            <h3 className="font-extrabold text-gray-900 text-base">{addr.customerName}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{addr.deliveryAddress}</p>
                            <p className="text-sm text-gray-500 font-medium">{addr.postOffice}, {addr.district}, {addr.state} — {addr.pincode}</p>
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
                              <Smartphone className="w-3.5 h-3.5 text-gray-400" />
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
                              className="mt-5 pp-gradient text-white w-full py-3 rounded-xl font-black text-sm shadow-pp hover:brightness-110 transition-all animate-in slide-in-from-bottom-2 duration-300 flex items-center justify-center gap-2"
                            >
                              DELIVER TO THIS ADDRESS
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add New Address Card */}
                      <div 
                        onClick={() => setShowAddressForm(true)}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-pp-primary hover:bg-violet-50/30 transition-all min-h-[220px] group bg-white/50"
                      >
                        <div className="w-12 h-12 rounded-full bg-violet-50 text-pp-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Plus className="w-6 h-6" />
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
                {(showAddressForm || (addresses.length === 0 && !isLoading)) && (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-pp-primary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pp-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-pp-primary" />
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
                          <X className="w-5 h-5" />
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
                                <label key={type} className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.addressType === type ? "border-pp-primary bg-violet-50 text-pp-primary shadow-sm" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}>
                                  <input type="radio" name="addressType" value={type} checked={formData.addressType === type} onChange={() => setFormData(p => ({ ...p, addressType: type }))} className="hidden" />
                                  {type === "home" ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
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
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-pp-primary/5 overflow-hidden text-left">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Review Order</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-pp-primary" />
                        <p className="text-xs text-gray-500">
                          Delivering to <span className="font-bold text-gray-900">{selectedAddrObj.customerName}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveStep("address")} 
                      className="px-4 py-2 rounded-xl bg-violet-50 text-pp-primary text-xs font-black hover:bg-violet-100 transition-colors uppercase tracking-wider"
                    >
                      Change
                    </button>
                  </div>
                  
                  <div className="p-6 bg-violet-50/30 border-b border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      {selectedAddrObj.deliveryAddress}, {selectedAddrObj.district}, {selectedAddrObj.state}
                    </p>
                  </div>

                  <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto no-scrollbar">
                    {cart.map((item) => (
                      <div key={item.id} className="p-6 flex gap-6 items-center group hover:bg-gray-50/50 transition-colors">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-pp-primary transition-colors">{item.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Qty: {item.cartQuantity}</span>
                            <span className="text-xs text-pp-success font-bold uppercase tracking-wider">In Stock</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-black text-gray-900">{formatPrice(item.price * item.cartQuantity)}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">({formatPrice(item.price)} each)</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-50/30">
                    <div className="flex items-center gap-3 text-gray-500">
                      <ShieldCheck className="w-5 h-5 text-pp-success" />
                      <span className="text-xs font-bold uppercase tracking-widest">Safe & Secure Delivery</span>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button 
                        onClick={() => setActiveStep("address")} 
                        className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-all uppercase text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => { setActiveStep("payment"); window.scrollTo(0, 0); }}
                        className="flex-1 sm:flex-none pp-gradient text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:shadow-pp-primary/20 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest"
                      >
                        Proceed to Payment
                      </button>
                    </div>
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
                  <div className="border-2 border-pp-primary bg-violet-50/30 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <input type="radio" name="payment" id="cod" className="w-4 h-4 accent-pp-primary mt-1" defaultChecked />
                      <div className="flex flex-col gap-1 flex-1">
                        <label htmlFor="cod" className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-pp-primary" />
                          Cash on Delivery
                        </label>
                        <span className="text-xs text-pp-success font-semibold">Verified Safe Payment</span>
                        <button
                          onClick={handlePlaceOrder}
                          disabled={isPlacingOrder}
                          className="mt-6 pp-gradient text-white px-12 py-3.5 rounded-xl font-black shadow-lg hover:shadow-xl transition-all w-full sm:w-fit flex items-center justify-center gap-2"
                        >
                          {isPlacingOrder ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              PLACING ORDER...
                            </>
                          ) : (
                            `CONFIRM ORDER — ${formatPrice(cartTotal)}`
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <PaymentOption icon={Smartphone} id="upi" label="UPI" subtitle="Google Pay, PhonePe, Paytm" disabled />
                  <PaymentOption icon={CreditCard} id="card" label="Credit / Debit Card" subtitle="Visa, Mastercard, RuPay" disabled />
                </div>
                <div className="p-5 bg-gray-50/50 flex items-center gap-2 text-gray-400 justify-center">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">100% Secure & Encrypted Payments</span>
                </div>
              </div>
            )}
          </div>

          <div
            className={`lg:w-[340px] w-full self-start ${activeStep === "address" ? "lg:mt-14" : ""} lg:sticky lg:top-32`}
          >
            <div className="bg-white rounded-2xl border border-gray-100 pp-shadow overflow-hidden">
              <h2 className="text-xs font-bold text-gray-400 tracking-widest p-5 border-b border-gray-100 uppercase">Price Details</h2>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>{formatPrice(cartMrpTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Discount</span>
                  <span className="text-pp-success font-semibold">- {formatPrice(cartMrpTotal - cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Delivery</span>
                  <span className="text-pp-success font-semibold">Free</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-lg font-black text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <div className="bg-pp-success/10 p-3 text-center border-t border-pp-success/10">
                <p className="text-pp-success text-[11px] font-bold uppercase tracking-wide">You saved {formatPrice(cartMrpTotal - cartTotal)} on this order!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
        className={`border-2 rounded-2xl p-4 outline-none transition-all text-sm w-full font-medium ${
          readOnly 
            ? "bg-gray-50 cursor-not-allowed text-gray-400 border-gray-100" 
            : "bg-white border-gray-100 focus:border-pp-primary focus:shadow-lg focus:shadow-pp-primary/5 hover:border-gray-200"
        }`}
      />
    </div>
  );
}

function PaymentOption({ icon: Icon, id, label, subtitle, disabled }: any) {
  return (
    <div className={`border border-gray-200 rounded-xl p-4 transition-all ${disabled ? "opacity-40 cursor-not-allowed bg-gray-50/50" : "cursor-pointer hover:border-pp-primary"}`}>
      <div className="flex items-start gap-4">
        <input type="radio" name="payment" id={id} disabled={disabled} className="w-4 h-4 mt-1 accent-pp-primary" />
        <div className="flex flex-col gap-0.5 items-start text-left">
          <label htmlFor={id} className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400" />
            {label}
          </label>
          <span className="text-xs text-gray-400">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
