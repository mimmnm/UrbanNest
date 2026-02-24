"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Lock, CreditCard, ChevronRight, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const orderId = useMemo(
    () => `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    []
  );

  if (orderPlaced) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
          >
            <Check size={36} className="text-emerald-500" />
          </motion.div>
          <h1 className="font-display text-2xl font-semibold text-[#111111] mb-3">
            Order Confirmed!
          </h1>
          <p className="text-[#a1a1aa] text-sm mb-2">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="font-display text-xs text-[#a1a1aa] mb-8">{orderId}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] text-white rounded-full font-display text-sm font-medium hover:bg-[#66a80f] transition-colors duration-300"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-[#111111] mb-4">
            No items to checkout
          </h1>
          <Link
            href="/products"
            className="font-display text-sm text-[#66a80f] underline hover:text-[#111111] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice > 7500 ? 0 : 150;
  const tax = Math.round(totalPrice * 0.05);
  const total = totalPrice + shipping + tax;

  const inputClass =
    "w-full px-4 py-3.5 bg-[#ffffff] border border-[#d4e8c2] rounded-xl text-sm focus:outline-none focus:border-[#66a80f] transition-colors placeholder:text-[#a1a1aa]";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        {/* Steps */}
        <div className="flex items-center gap-2 text-xs font-display text-[#a1a1aa] mb-10">
          <Link href="/cart" className="hover:text-[#66a80f] transition-colors">
            Cart
          </Link>
          <ChevronRight size={12} />
          <span className={step >= 1 ? "text-[#111111] font-medium" : ""}>
            Information
          </span>
          <ChevronRight size={12} />
          <span className={step >= 2 ? "text-[#111111] font-medium" : ""}>
            Payment
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-14">
          {/* Form */}
          <div>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="font-display text-xl font-semibold text-[#111111] mb-7">
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        First Name
                      </label>
                      <input type="text" className={inputClass} placeholder="John" />
                    </div>
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        Last Name
                      </label>
                      <input type="text" className={inputClass} placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Address
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="House 12, Road 5, Gulshan"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        City
                      </label>
                      <input type="text" className={inputClass} placeholder="Dhaka" />
                    </div>
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        District
                      </label>
                      <input type="text" className={inputClass} placeholder="Dhaka" />
                    </div>
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        ZIP
                      </label>
                      <input type="text" className={inputClass} placeholder="1212" />
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-[#111111] text-white rounded-xl font-display text-sm font-medium hover:bg-[#66a80f] transition-colors duration-300 mt-6"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button
                  onClick={() => setStep(1)}
                  className="font-display text-sm text-[#a1a1aa] hover:text-[#66a80f] mb-7 transition-colors"
                >
                  ← Back to Information
                </button>
                <h2 className="font-display text-xl font-semibold text-[#111111] mb-7">
                  Payment Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl mb-2">
                    <Lock size={14} className="text-blue-500" />
                    <span className="text-xs text-blue-700">
                      Your payment information is encrypted and secure
                    </span>
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="1234 5678 9012 3456"
                      />
                      <CreditCard
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        Expiry Date
                      </label>
                      <input type="text" className={inputClass} placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        CVC
                      </label>
                      <input type="text" className={inputClass} placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Name on Card
                    </label>
                    <input type="text" className={inputClass} placeholder="John Doe" />
                  </div>
                  <button
                    onClick={() => {
                      clearCart();
                      setOrderPlaced(true);
                    }}
                    className="w-full py-4 bg-[#111111] text-white rounded-xl font-display text-sm font-medium hover:bg-[#66a80f] transition-colors duration-300 mt-6"
                  >
                    Place Order — {formatPrice(total)}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-7">
              <h3 className="font-display text-sm font-semibold text-[#111111] mb-6">
                Order Summary
              </h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f8f6f3] flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#111111] text-white text-[9px] font-display rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-[#111111] truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-[#a1a1aa] capitalize">
                        {item.product.category}
                      </p>
                    </div>
                    <span className="font-display text-sm font-medium text-[#111111]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#d4e8c2]/40 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Subtotal</span>
                  <span className="font-display">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Shipping</span>
                  <span className="font-display">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Tax</span>
                  <span className="font-display">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-3 border-t border-[#d4e8c2]/40">
                  <span className="font-display">Total</span>
                  <span className="font-display text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}