"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import type { Product as CartProduct } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const wishlisted = isInWishlist(product.id);
  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="block relative aspect-[3/4] rounded-2xl bg-white mb-4 img-zoom overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover rounded-2xl"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-display font-semibold tracking-[0.1em] uppercase text-[#111111]">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="inline-block px-3 py-1 bg-[#66a80f] rounded-full text-[10px] font-display font-semibold tracking-[0.1em] uppercase text-white">
              Bestseller
            </span>
          )}
          {discount > 0 && !product.isNew && !product.isBestSeller && (
            <span className="inline-block px-3 py-1 bg-[#111111] rounded-full text-[10px] font-display font-semibold tracking-[0.1em] uppercase text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
                tags: product.tags,
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
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="flex-1 py-3 bg-white/95 backdrop-blur-sm rounded-xl text-[#111111] text-xs font-display font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#111111] hover:text-white transition-colors duration-300"
          >
            {added ? (
              <>
                <Check size={14} />
                Added!
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                Add to Cart
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product);
            }}
            className={`w-11 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors duration-300 ${
              wishlisted ? "text-red-500 hover:text-red-600" : "text-[#111111] hover:bg-[#66a80f] hover:text-white"
            }`}
          >
            <Heart size={14} className={wishlisted ? "fill-current" : ""} />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="px-1">
        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="font-display text-sm font-medium text-[#111111] mb-1 hover:text-[#66a80f] transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < Math.floor(product.rating)
                    ? "fill-[#66a80f] text-[#66a80f]"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-[#a1a1aa] font-display">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-[#111111]">
            ৳{product.price}
          </span>
          {discount > 0 && (
            <span className="text-xs text-[#a1a1aa] line-through font-display">
              ৳{product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}