"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Lock, ChevronRight, Check, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

function getProductImage(product: { image?: string; images?: string[] }): string {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return "/placeholder.png";
}

export default function CheckoutPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Auto-fill from user profile
  useEffect(() => {
    if (authStatus !== "authenticated" || profileLoaded) return;
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          const u = data.user;
          const nameParts = (u.name || "").trim().split(/\s+/);
          if (!firstName) setFirstName(nameParts[0] || "");
          if (!lastName) setLastName(nameParts.slice(1).join(" ") || "");
          if (!email) setEmail(u.email || "");
          if (!phone) setPhone(u.phone || "");
          if (!address) setAddress(u.address || "");
          if (!city) setCity(u.city || "");
          if (!district) setDistrict(u.district || "");
          if (!zip) setZip(u.zipCode || "");
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, [authStatus, profileLoaded, firstName, lastName, email, phone, address, city, district, zip]);

  // Redirect to login if not authenticated
  if (authStatus === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#66a80f]/30 border-t-[#66a80f] rounded-full animate-spin" />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

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
          <p className="font-display text-sm font-medium text-[#66a80f] mb-8">
            {confirmedOrderId}
          </p>
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

  const shipping = totalPrice >= 7500 ? 0 : 120;
  const total = totalPrice + shipping;

  const inputClass =
    "w-full px-4 py-3.5 bg-[#ffffff] border border-[#d4e8c2] rounded-xl text-sm font-display focus:outline-none focus:border-[#66a80f] transition-colors placeholder:text-[#a1a1aa]";

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!address.trim()) {
      setError("Please enter your shipping address");
      return false;
    }
    if (!city.trim()) {
      setError("Please enter your city");
      return false;
    }
    setError("");
    return true;
  };

  const handlePlaceOrder = async () => {
    setError("");
    setSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));

      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const shippingAddress = `${address.trim()}, ${city.trim()}, ${district.trim()} ${zip.trim()}`.replace(/,\s*,/g, ",").trim();

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: fullName,
          phone: phone.trim(),
          shippingAddress,
          items: orderItems,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order. Please try again.");
        return;
      }

      setConfirmedOrderId(data.order?.orderId || "");
      clearCart();
      setOrderPlaced(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

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
                        First Name *
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder="+880 1XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                      Address *
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="House 12, Road 5, Gulshan"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Dhaka"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        District
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Dhaka"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-display text-xs text-[#a1a1aa] mb-1.5">
                        ZIP
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="1212"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
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
                  onClick={() => { setStep(1); setError(""); }}
                  className="font-display text-sm text-[#a1a1aa] hover:text-[#66a80f] mb-7 transition-colors"
                >
                  ← Back to Information
                </button>
                <h2 className="font-display text-xl font-semibold text-[#111111] mb-7">
                  Payment Method
                </h2>
                <div className="space-y-4">
                  {/* Payment method selection */}
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-[#66a80f] bg-[#66a80f]/5"
                          : "border-[#d4e8c2] hover:border-[#66a80f]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#66a80f]"
                      />
                      <div>
                        <p className="font-display text-sm font-medium text-[#111111]">Cash on Delivery</p>
                        <p className="text-xs text-[#a1a1aa]">Pay when you receive your order</p>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        paymentMethod === "card"
                          ? "border-[#66a80f] bg-[#66a80f]/5"
                          : "border-[#d4e8c2] hover:border-[#66a80f]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="accent-[#66a80f]"
                      />
                      <div>
                        <p className="font-display text-sm font-medium text-[#111111]">Online Payment</p>
                        <p className="text-xs text-[#a1a1aa]">bKash, Nagad, or Card</p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="mt-4 p-4 bg-blue-50/70 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock size={14} className="text-blue-500" />
                        <span className="text-xs text-blue-700 font-display">
                          Payment gateway integration coming soon. Use Cash on Delivery for now.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Shipping summary */}
                  <div className="p-4 bg-[#f8f6f3] rounded-xl mt-4">
                    <p className="text-xs font-display text-[#a1a1aa] uppercase tracking-wider mb-2">Shipping to</p>
                    <p className="text-sm font-display text-[#111111]">
                      {firstName} {lastName}
                    </p>
                    <p className="text-xs text-[#a1a1aa]">
                      {address}, {city} {district} {zip}
                    </p>
                    <p className="text-xs text-[#a1a1aa]">{email}</p>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting || paymentMethod === "card"}
                    className="w-full py-4 bg-[#111111] text-white rounded-xl font-display text-sm font-medium hover:bg-[#66a80f] transition-colors duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order — ${formatPrice(total)}`
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-7 sticky top-28">
              <h3 className="font-display text-sm font-semibold text-[#111111] mb-6">
                Order Summary
              </h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f8f6f3] flex-shrink-0">
                      <Image
                        src={getProductImage(item.product)}
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
