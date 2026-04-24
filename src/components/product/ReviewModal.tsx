"use client";

import React, { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { submitReview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { mutate } from "swr";
import { swrKeys } from "@/lib/swrKeys";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  orderId: string; // The UUID line item id
}

export default function ReviewModal({ isOpen, onClose, productId, productName, orderId }: ReviewModalProps) {
  const { token } = useAuth();
  const { success, error } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await submitReview(token, productId, rating, orderId, comment);
      success("Review submitted successfully!");
      mutate(swrKeys.productReviews(productId));
      onClose();
    } catch (err: any) {
      error(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-8 border-b border-gray-50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Rate & Review</h2>
            <p className="text-sm font-bold text-gray-400 mt-1">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all active:scale-90"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      (hoveredRating || rating) >= star 
                        ? "fill-pp-accent-warm text-pp-accent-warm" 
                        : "text-gray-100"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Your Review</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or disliked about this product..."
              className="w-full h-32 p-6 rounded-3xl border-2 border-gray-100 focus:border-pp-primary outline-none transition-all text-sm font-medium resize-none placeholder:text-gray-300"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 border-2 border-gray-50 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-pp-primary shadow-lg shadow-pp-primary/20 hover:shadow-pp-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Post Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
