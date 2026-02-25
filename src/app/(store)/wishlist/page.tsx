"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import type { Product as CartProduct } from "@/lib/types";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: typeof items[0]) => {
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug || product.id,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      images: product.images || [product.image],
      category: product.category,
      tags: product.tags || [],
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      featured: product.featured,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      colors: product.colors,
      sizes: product.sizes,
    };
    addItem(cartProduct);
  };

  if (items.length === 0) {
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <h1 className="font-display text-2xl font-semibold text-[#111111] mb-8">
          My Wishlist ({items.length})
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <Link
                href={`/products/${product.slug || product.id}`}
                className="block relative aspect-[3/4] rounded-2xl bg-white mb-4 overflow-hidden"
              >
                <Image
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-2xl"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="flex-1 py-3 bg-white/95 backdrop-blur-sm rounded-xl text-[#111111] text-xs font-display font-medium flex items-center justify-center gap-2 hover:bg-[#111111] hover:text-white transition-colors"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(product.id);
                    }}
                    className="w-11 bg-white/95 backdrop-blur-sm rounded-xl text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Link>
              <div className="px-1">
                <h3 className="font-display text-sm font-medium text-[#111111] mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-[#111111]">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-[#a1a1aa] line-through font-display">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
