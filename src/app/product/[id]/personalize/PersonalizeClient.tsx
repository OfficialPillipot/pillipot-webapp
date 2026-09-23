"use client";

import { useState, useEffect } from "react";
import { type Product, uploadCustomPhotoApi } from "@/lib/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  LuChevronLeft, 
  LuUpload, 
  LuLoader, 
  LuCheck, 
  LuTrash2, 
  LuSparkles, 
  LuImage, 
  LuType, 
  LuFileText, 
  LuPencil, 
  LuArrowRight, 
  LuZap, 
  LuCircleAlert,
  LuShoppingBag
} from "react-icons/lu";
import { useToast } from "@/context/ToastContext";

interface PersonalizeClientProps {
  product: Product;
}

export default function PersonalizeClient({ product }: PersonalizeClientProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const allowPhoto = !!product.allowPhotoUpload;
  const allowText = !!product.allowTextInput;
  const promptText = product.customTextPrompt || "Enter custom text (name, quote, or message)";
  const maxLimit = product.customTextLimit || 50;

  // Customization fields
  const [customText, setCustomText] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [customNote, setCustomNote] = useState("");

  // UI state
  const [step, setStep] = useState<"form" | "preview">("form");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Quick note suggestions
  const noteSuggestions = [
    "Gift message for recipient",
    "Please pack with extra care",
    "Add elegant gift wrap & ribbon",
    "Center-align the engraved text",
  ];

  // Load existing customization if already stored
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`pillipot_customization_${product.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.customText) setCustomText(parsed.customText);
        if (parsed.customPhotoUrl) setCustomPhotoUrl(parsed.customPhotoUrl);
        if (parsed.customNote) setCustomNote(parsed.customNote);
      }
    } catch (e) {
      console.error("Failed to load stored customization", e);
    }
  }, [product.id]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      error("Photo size must be less than 10MB");
      return;
    }

    setUploadingPhoto(true);
    setErrors((prev) => ({ ...prev, photo: "" }));
    try {
      const res = await uploadCustomPhotoApi(file);
      setCustomPhotoUrl(res.url);
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
  };

  // Validation function requiring all requested details
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (allowPhoto && !customPhotoUrl) {
      newErrors.photo = "Please upload an image for your customization.";
    }

    if (allowText) {
      if (!customText.trim()) {
        newErrors.text = "Please enter the required custom text.";
      } else if (customText.length > maxLimit) {
        newErrors.text = `Custom text exceeds limit of ${maxLimit} characters.`;
      }
    }

    if (!customNote.trim()) {
      newErrors.note = "Please add a note or special instructions (e.g. gift note or packaging request).";
    } else if (customNote.length > 300) {
      newErrors.note = "Note exceeds maximum limit of 300 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      error(firstError);
      return false;
    }

    return true;
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCustomizationData = () => {
    const customizationData = {
      productId: product.id,
      customText: customText.trim() || undefined,
      customPhotoUrl: customPhotoUrl || undefined,
      customNote: customNote.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`pillipot_customization_${product.id}`, JSON.stringify(customizationData));
  };

  const handleFinalizePurchase = (action: "buyNow" | "returnToProduct") => {
    setIsFinalizing(true);
    try {
      saveCustomizationData();
      success("Customization finalized successfully!");

      if (action === "buyNow") {
        const params = new URLSearchParams({
          buyNow: product.id,
          qty: "1",
        });
        if (customText.trim()) params.append("customText", customText.trim());
        if (customPhotoUrl) params.append("customPhotoUrl", customPhotoUrl);
        if (customNote.trim()) params.append("customNote", customNote.trim());
        router.push(`/checkout?${params.toString()}`);
      } else {
        router.push(`/product/${product.id}`);
      }
    } catch {
      error("Failed to finalize customization");
      setIsFinalizing(false);
    }
  };

  return (
    <main className="pp-container py-6 sm:py-10 max-w-3xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (step === "preview") {
              setStep("form");
            } else {
              router.push(`/product/${product.id}`);
            }
          }}
          className="flex items-center gap-1.5 text-pp-primary font-bold text-sm hover:bg-pp-primary/5 px-4 py-2 rounded-full transition-colors border border-pp-primary/20"
        >
          <LuChevronLeft className="w-4 h-4" />
          {step === "preview" ? "Back to Edit" : "Back to Product"}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-full transition-all ${
                step === "form"
                  ? "bg-pp-primary text-white shadow-xs"
                  : "bg-white text-emerald-700 font-extrabold flex items-center gap-1"
              }`}
            >
              {step === "preview" ? <LuCheck className="w-3.5 h-3.5" /> : null}
              1. Personalize
            </span>
            <span
              className={`px-3 py-1 rounded-full transition-all ${
                step === "preview"
                  ? "bg-pp-primary text-white shadow-xs"
                  : "text-slate-400"
              }`}
            >
              2. Preview
            </span>
          </div>
        </div>
      </div>

      {/* Product Summary Header Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
              Personalized Product
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-1">
            {product.name}
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* STEP 1: FORM MODE */}
      {step === "form" && (
        <form onSubmit={handleProceed} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                <LuSparkles className="text-pp-primary w-6 h-6" />
                Personalize Your Product
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Please provide all requested customization details below. You will be able to review a full preview before finalizing.
              </p>
            </div>

            {/* Photo Upload Section */}
            {allowPhoto && (
              <div className={`space-y-3 rounded-2xl border p-4 sm:p-5 transition-all ${
                errors.photo ? "border-rose-300 bg-rose-50/30" : "border-slate-200 bg-slate-50/50"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pp-primary/10 flex items-center justify-center text-pp-primary">
                      <LuImage className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        Image Upload
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                          Required
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Upload high-resolution JPG, PNG or WebP (max 10MB)
                      </p>
                    </div>
                  </div>
                </div>

                {customPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-pp-primary/40 bg-white p-3 flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <Image
                        src={customPhotoUrl}
                        alt="Uploaded preview"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                        <LuCheck className="w-3.5 h-3.5" /> Photo Attached
                      </span>
                      <p className="text-xs text-slate-600 truncate">Ready for personalization</p>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        <LuTrash2 className="w-3.5 h-3.5" /> Remove & Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed bg-white hover:border-pp-primary hover:bg-pp-primary/5 transition-all cursor-pointer group ${
                    errors.photo ? "border-rose-300" : "border-slate-300"
                  }`}>
                    {uploadingPhoto ? (
                      <div className="flex flex-col items-center gap-2 text-pp-primary">
                        <LuLoader className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">Uploading your photo...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-pp-primary/10 flex items-center justify-center text-pp-primary group-hover:scale-110 transition-transform mb-2">
                          <LuUpload className="w-6 h-6" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          Click to upload photo
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Supports JPEG, PNG, WEBP up to 10MB
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={handlePhotoSelect}
                    />
                  </label>
                )}

                {errors.photo && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <LuCircleAlert className="w-3.5 h-3.5 shrink-0" /> {errors.photo}
                  </p>
                )}
              </div>
            )}

            {/* Text Input Section */}
            {allowText && (
              <div className={`space-y-3 rounded-2xl border p-4 sm:p-5 transition-all ${
                errors.text ? "border-rose-300 bg-rose-50/30" : "border-slate-200 bg-slate-50/50"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pp-primary/10 flex items-center justify-center text-pp-primary">
                      <LuType className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        Text Input
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                          Required
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {promptText}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${customText.length > maxLimit ? "text-rose-600" : "text-slate-400"}`}>
                    {customText.length} / {maxLimit}
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={maxLimit}
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value);
                      if (errors.text) setErrors((prev) => ({ ...prev, text: "" }));
                    }}
                    placeholder={promptText}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-pp-primary focus:outline-none focus:ring-2 focus:ring-pp-primary/20 transition-all placeholder:text-slate-400 ${
                      errors.text ? "border-rose-300" : "border-slate-300"
                    }`}
                  />
                  {errors.text ? (
                    <p className="text-xs font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <LuCircleAlert className="w-3.5 h-3.5 shrink-0" /> {errors.text}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      * Maximum {maxLimit} characters allowed. Please verify spelling.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* "Add Note" Field Section */}
            <div className={`space-y-3 rounded-2xl border p-4 sm:p-5 transition-all ${
              errors.note ? "border-rose-300 bg-rose-50/30" : "border-slate-200 bg-slate-50/50"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pp-primary/10 flex items-center justify-center text-pp-primary">
                    <LuFileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Add Note
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                        Required
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Gift message, artisan instructions, or special packaging notes
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${customNote.length > 300 ? "text-rose-600" : "text-slate-400"}`}>
                  {customNote.length} / 300
                </span>
              </div>

              <div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={customNote}
                  onChange={(e) => {
                    setCustomNote(e.target.value);
                    if (errors.note) setErrors((prev) => ({ ...prev, note: "" }));
                  }}
                  placeholder="e.g. Please write 'Happy Anniversary Mom & Dad' on the card and pack with extra bubble wrap..."
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-pp-primary focus:outline-none focus:ring-2 focus:ring-pp-primary/20 transition-all placeholder:text-slate-400 resize-none ${
                    errors.note ? "border-rose-300" : "border-slate-300"
                  }`}
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Suggestions:</span>
                  {noteSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomNote((prev) => (prev ? `${prev}, ${sug}` : sug));
                        if (errors.note) setErrors((prev) => ({ ...prev, note: "" }));
                      }}
                      className="text-[11px] font-semibold bg-white hover:bg-pp-primary/10 text-slate-600 hover:text-pp-primary border border-slate-200 px-2 py-0.5 rounded-full transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                {errors.note ? (
                  <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1">
                    <LuCircleAlert className="w-3.5 h-3.5 shrink-0" /> {errors.note}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-2">
                    * Make sure all instructions are clear. All details are verified before production.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Proceed */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={uploadingPhoto}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pp-primary text-white py-4 px-8 font-bold text-sm sm:text-base shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Preview</span>
              <LuArrowRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => router.push(`/product/${product.id}`)}
              className="w-full sm:w-auto px-6 py-4 rounded-full border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: PREVIEW MODE */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-purple-200/80 p-5 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                  Step 2: Customization Preview
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 flex items-center gap-2">
                  <LuSparkles className="text-amber-500 w-6 h-6" />
                  Review Your Customization
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Confirm your personalized details before finalizing the purchase. You can make adjustments anytime by clicking Edit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full border border-purple-200 transition-colors"
              >
                <LuPencil className="w-4 h-4" />
                Edit Details
              </button>
            </div>

            {/* Customization Details Preview Mockup Card */}
            <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 p-5 sm:p-6 space-y-6">
              
              {/* Image Preview (if uploaded) */}
              {customPhotoUrl && (
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 block">
                    1. Uploaded Custom Photo
                  </span>
                  <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-xs">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-purple-200 shrink-0">
                      <Image
                        src={customPhotoUrl}
                        alt="Customized Preview"
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <LuCheck className="w-3.5 h-3.5" /> High-Resolution Photo Ready
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        This photo will be professionally printed / engraved onto your product.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="mt-2 text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
                      >
                        <LuPencil className="w-3 h-3" /> Change Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Input Preview (if applicable) */}
              {customText && (
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 block">
                    {allowPhoto ? "2. Custom Text / Inscription" : "1. Custom Text / Inscription"}
                  </span>
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-xs text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Rendered Inscription
                    </span>
                    <p className="font-serif text-lg sm:text-xl font-bold text-purple-950 tracking-wide break-words italic px-4 py-2 bg-purple-50/60 rounded-xl border border-purple-200/60">
                      &ldquo;{customText}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Character count: {customText.length} / {maxLimit}
                    </p>
                  </div>
                </div>
              )}

              {/* Note Preview */}
              {customNote && (
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 block">
                    {allowPhoto && customText ? "3. Note / Special Instructions" : allowPhoto || customText ? "2. Note / Special Instructions" : "1. Note / Special Instructions"}
                  </span>
                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-800">
                      <LuFileText className="w-4 h-4" />
                      <span>Artisan & Packaging Note:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 italic pl-6 border-l-2 border-purple-300 py-1 break-words">
                      &ldquo;{customNote}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Quality & Production Badge */}
              <div className="flex items-center gap-3 bg-purple-100/50 rounded-xl p-3 border border-purple-200/60 text-xs text-purple-900">
                <LuSparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <span>
                  Our craftspeople will verify all details before engraving and packaging your order with utmost care.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit & Finalize Purchase */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full sm:w-auto px-6 py-4 rounded-full border-2 border-purple-300 text-purple-700 font-bold text-sm hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <LuPencil className="w-4 h-4" />
              Edit Customization
            </button>

            <button
              type="button"
              disabled={isFinalizing}
              onClick={() => handleFinalizePurchase("buyNow")}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pp-primary text-white py-4 px-8 font-bold text-sm sm:text-base shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isFinalizing ? (
                <>
                  <LuLoader className="w-5 h-5 animate-spin" /> Finalizing...
                </>
              ) : (
                <>
                  <LuZap className="w-5 h-5" /> Finalize Purchase (Buy Now)
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isFinalizing}
              onClick={() => handleFinalizePurchase("returnToProduct")}
              className="w-full sm:w-auto px-6 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <LuShoppingBag className="w-4 h-4" />
              Save & Back to Product
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

