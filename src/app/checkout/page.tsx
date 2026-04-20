"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, MapPin, CreditCard, Banknote, Smartphone, Plus, Trash2, Home, Briefcase, Loader2, PencilLine, Package } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getAddresses, addAddress, autofillAddress, checkout, type CustomerAddress, deleteAddress, setDefaultAddress, updateAddress } from "@/lib/api";

type Step = "address" | "summary" | "payment";

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
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
    email: "",
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

  // Phone Autofill logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.phone.length === 10) {
        const data = await autofillAddress(formData.phone);
        if (data) {
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
            email: data.email || prev.email,
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
        if (data) {
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
            email: data.email || prev.email,
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
      email: addr.email || "",
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
      alert("Please provide an address");
      setIsPlacingOrder(false);
      return;
    }

    const res = await checkout(cart, checkoutInfo);
    if (res) {
      clearCart();
      router.push(`/order-success?orderId=${res.orderId}`);
    } else {
      alert("Something went wrong. Please try again.");
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

      <main className="flex-1 pp-container px-4 py-6">
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
                  <div className="bg-white rounded-2xl border border-gray-100 pp-shadow overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-pp-primary" />
                        <h2 className="font-bold text-gray-900">Saved Addresses</h2>
                      </div>
                      <button 
                        onClick={() => setShowAddressForm(true)}
                        className="text-pp-primary text-sm font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-4 h-4" /> ADD NEW
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer ${
                            selectedAddressId === addr.id ? "border-pp-primary bg-violet-50/20 shadow-sm" : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${selectedAddressId === addr.id ? "border-pp-primary" : "border-gray-300"}`}>
                                {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-pp-primary" />}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{addr.customerName}</span>
                                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded font-bold uppercase">{addr.addressType}</span>
                                  {addr.isDefault && <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-pp-primary rounded font-bold uppercase">Default</span>}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed text-left">{addr.deliveryAddress}</p>
                                <p className="text-sm text-gray-900 font-semibold">{addr.phone}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => handleEditClick(addr, e)} 
                                className="text-gray-300 hover:text-pp-primary transition-colors p-1"
                                title="Edit address"
                              >
                                <PencilLine className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteAddress(addr.id, e)} 
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                title="Delete address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {selectedAddressId === addr.id && (
                            <button 
                              onClick={() => setActiveStep("summary")}
                              className="mt-4 pp-gradient text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-md"
                            >
                              DELIVER HERE
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Form (Add New or Initial for Guest) */}
                {(showAddressForm || (addresses.length === 0 && !isLoading)) && (
                  <div className="bg-white rounded-2xl border border-gray-100 pp-shadow overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-pp-primary" />
                        <h2 className="font-bold text-gray-900">{editAddressId ? "Edit Address" : (addresses.length > 0 ? "Add New Address" : "Delivery Address")}</h2>
                      </div>
                      {addresses.length > 0 && (
                        <button onClick={() => { setShowAddressForm(false); setEditAddressId(null); }} className="text-gray-400 hover:text-gray-600 font-semibold text-sm">Cancel</button>
                      )}
                    </div>
                    <form onSubmit={handleAddAddress} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required maxLength={10} autoFocus />
                        <InputField label="Full Name" name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField label="Alternate Phone (Optional)" name="secondaryPhone" value={formData.secondaryPhone} onChange={handleInputChange} />
                        <InputField label="Email (Optional)" name="email" value={formData.email} onChange={handleInputChange} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField label="Flat/House/Building Name *" name="flatBuilding" value={formData.flatBuilding} onChange={handleInputChange} required placeholder="Flat/House/Building Name" />
                        <InputField label="Area/Sector/Locality *" name="areaSector" value={formData.areaSector} onChange={handleInputChange} required placeholder="Area/Sector/Locality" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField label="Pincode *" name="pincode" value={formData.pincode} onChange={handleInputChange} required maxLength={6} placeholder="Pincode" />
                        <InputField label="Post Office *" name="postOffice" value={formData.postOffice} onChange={handleInputChange} required placeholder="Post Office" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField label="State *" name="state" value={formData.state} onChange={handleInputChange} required placeholder="State" />
                        <InputField label="District *" name="district" value={formData.district} onChange={handleInputChange} required placeholder="District" />
                      </div>

                      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4">
                          <button type="submit" className="pp-gradient text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                            {editAddressId ? "SAVE CHANGES" : "SAVE & CONTINUE"}
                          </button>
                          <button type="button" onClick={() => router.push("/cart")} className="text-gray-500 font-semibold text-sm hover:text-pp-primary">
                            Back to Cart
                          </button>
                        </div>
                        
                        <div className="flex gap-4">
                           {(["home", "work"] as const).map((type) => (
                            <label key={type} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${formData.addressType === type ? "border-pp-primary bg-violet-50 text-pp-primary" : "border-gray-100 text-gray-500"}`}>
                              <input type="radio" name="addressType" value={type} checked={formData.addressType === type} onChange={() => setFormData(p => ({ ...p, addressType: type }))} className="hidden" />
                              {type === "home" ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                              <span className="text-xs font-bold uppercase">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {activeStep === "summary" && (
              <div className="bg-white rounded-2xl border border-gray-100 pp-shadow overflow-hidden text-left">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">Order Summary</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Delivering to: <b className="text-pp-primary">{selectedAddrObj.customerName}</b> — {selectedAddrObj.deliveryAddress}, {selectedAddrObj.district}, {selectedAddrObj.state}
                    </p>
                  </div>
                  <button onClick={() => setActiveStep("address")} className="text-pp-primary text-sm font-bold hover:underline">Change</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {cart.map((item) => (
                    <div key={item.id} className="p-5 flex gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500">Qty: {item.cartQuantity}</p>
                      </div>
                      <span className="font-bold text-gray-900">{formatPrice(item.price * item.cartQuantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
                  <button onClick={() => setActiveStep("address")} className="text-gray-500 font-semibold text-sm">Back</button>
                  <button
                    onClick={() => { setActiveStep("payment"); window.scrollTo(0, 0); }}
                    className="pp-gradient text-white px-10 py-3 rounded-xl font-bold shadow-lg"
                  >
                    PROCEED TO PAY
                  </button>
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

          <div className="lg:w-[340px] w-full sticky top-32">
            <div className="bg-white rounded-2xl border border-gray-100 pp-shadow overflow-hidden">
              <h2 className="text-xs font-bold text-gray-400 tracking-widest p-5 border-b border-gray-100 uppercase">Price Details</h2>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>{formatPrice(cartTotal + (cartTotal * 0.1))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Discount</span>
                  <span className="text-pp-success font-semibold">- {formatPrice(cartTotal * 0.1)}</span>
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
                <p className="text-pp-success text-[11px] font-bold uppercase tracking-wide">You saved ₹{(cartTotal * 0.1).toFixed(0)} on this order!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InputField({ label, name, value, onChange, required = false, maxLength, autoFocus, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        autoFocus={autoFocus}
        placeholder={placeholder || label}
        className="border border-gray-200 rounded-xl p-3.5 outline-none focus:border-pp-primary focus:ring-2 focus:ring-pp-primary/10 transition-all text-sm w-full bg-gray-50 focus:bg-white"
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
