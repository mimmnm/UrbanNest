"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-[#f8f6f3] flex items-center justify-center mx-auto mb-6">
          <Heart size={32} className="text-[#66a80f]" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#111111] mb-3">
          Your Wishlist is Empty
        </h1>
        <p className="text-[#a1a1aa] text-sm mb-8 max-w-sm">
          Save your favorite items to revisit them later. Start exploring our collection!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] transition-colors duration-300"
        >
          Browse Products
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}