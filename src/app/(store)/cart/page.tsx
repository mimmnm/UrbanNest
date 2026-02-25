"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

function getProductImage(product: { image?: string; images?: string[] }): string {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return "/placeholder.png";
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#f8f6f3] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-[#66a80f]" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#111111] mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-[#a1a1aa] text-sm mb-8">
            Looks like you haven&apos;t added any items yet
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] text-white rounded-full font-display text-sm font-medium hover:bg-[#66a80f] transition-colors duration-300"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-accent text-[#66a80f] text-base mb-1">your bag</p>
          <h1 className="font-display text-3xl font-semibold text-[#111111] mb-2">
            Shopping Cart
          </h1>
          <p className="text-sm text-[#a1a1aa] font-display mb-10">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 sm:gap-6 p-4 bg-white rounded-2xl border border-[#d4e8c2]/40"
              >
                <Link
                  href={`/products/${item.product.slug || item.product.id}`}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#f8f6f3] flex-shrink-0"
                >
                  <Image
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.product.slug || item.product.id}`}
                          className="font-display text-sm font-medium text-[#111111] hover:text-[#66a80f] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-[#a1a1aa] mt-0.5 capitalize">
                          {item.product.category}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-[#a1a1aa] hover:text-[#111111] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#d4e8c2] rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-2 text-[#111111] hover:bg-[#f8f6f3] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-9 text-center text-xs font-display font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-2 text-[#111111] hover:bg-[#f8f6f3] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-display text-sm font-semibold text-[#111111]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="sticky top-28 bg-white rounded-2xl border border-[#d4e8c2]/40 p-7">
              <h2 className="font-display text-lg font-semibold text-[#111111] mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Subtotal</span>
                  <span className="font-display font-medium text-[#111111]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a1a1aa]">Shipping</span>
                  <span className="font-display font-medium text-[#111111]">
                    {totalPrice >= 7500 ? "Free" : formatPrice(120)}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#d4e8c2]/40 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-display font-semibold text-[#111111]">
                    Total
                  </span>
                  <span className="font-display text-xl font-semibold text-[#111111]">
                    {formatPrice(
                      totalPrice +
                        (totalPrice >= 7500 ? 0 : 120)
                    )}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#111111] text-white rounded-xl font-display text-sm font-medium hover:bg-[#66a80f] transition-colors duration-300"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/products"
                className="block text-center mt-4 font-display text-sm text-[#a1a1aa] hover:text-[#66a80f] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}