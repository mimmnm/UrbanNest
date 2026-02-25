"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Minus, Plus, Heart, Share2, ChevronRight, Truck, RotateCcw, ShieldCheck, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/lib/data";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const [product, setProduct] = useState<(Product & { images?: string[]; colors?: string[]; sizes?: string[] }) | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProduct(data.product);

        // Fetch related products
        if (data.product?.category) {
          const relRes = await fetch(`/api/products?category=${data.product.category}&limit=4`);
          const relData = await relRes.json();
          setRelatedProducts(
            (relData.products || []).filter((p: Product) => p.slug !== slug && p.id !== data.product.id).slice(0, 4)
          );
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#66a80f]" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-[#111111] mb-3">Product not found</h1>
          <Link href="/products" className="font-display text-sm text-[#66a80f] hover:underline">Browse products</Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAdd = () => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug || slug,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      images: images,
      category: product.category,
      tags: product.tags || [],
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      featured: product.featured || product.isBestSeller || false,
      isNew: product.isNew || false,
      colors: product.colors,
      sizes: product.sizes,
    };
    addItem(cartProduct, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* breadcrumb */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5">
        <nav className="flex items-center gap-1.5 text-xs font-display text-[#a1a1aa]">
          <Link href="/" className="hover:text-[#111111] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#111111] transition-colors">Products</Link>
          <ChevronRight size={12} />
          <span className="text-[#111111]">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* image */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="relative">
            <div className="aspect-square bg-[#f8f6f3] rounded-3xl overflow-hidden">
              <Image src={images[selectedImage]} alt={product.name} width={700} height={700} className="w-full h-full object-cover" />
            </div>
            {product.isNew && (
              <span className="absolute top-5 left-5 bg-[#111111] text-white text-[10px] font-display uppercase tracking-[0.15em] px-3 py-1.5 rounded-full">New</span>
            )}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-[#66a80f]" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* details */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center py-4">
            <p className="font-accent text-[#66a80f] text-sm mb-2">{product.category}</p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#111111] mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-[#66a80f] text-[#66a80f]" : "text-[#d4e8c2]"} />
                ))}
              </div>
              <span className="text-xs font-display text-[#a1a1aa]">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-2xl font-bold text-[#111111]">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="font-display text-sm text-[#a1a1aa] line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-[10px] font-display uppercase tracking-wider bg-[#66a80f]/10 text-[#66a80f] px-2 py-0.5 rounded-full">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                  </span>
                </>
              )}
            </div>

            <p className="text-sm leading-relaxed text-[#a1a1aa] mb-8">{product.description}</p>

            {/* quantity + add */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-[#d4e8c2] rounded-full overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-[#a1a1aa] hover:text-[#111111] transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-display text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-[#a1a1aa] hover:text-[#111111] transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={handleAdd} className={`flex-1 py-3.5 rounded-full font-display text-sm font-medium tracking-wide transition-all ${added ? "bg-green-600 text-white" : "bg-[#111111] text-white hover:bg-[#66a80f]"}`}>
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            </div>

            <div className="flex items-center gap-5 mb-10">
              <button className="flex items-center gap-2 font-display text-xs text-[#a1a1aa] hover:text-[#66a80f] transition-colors">
                <Heart size={16} /> Wishlist
              </button>
              <button className="flex items-center gap-2 font-display text-xs text-[#a1a1aa] hover:text-[#66a80f] transition-colors">
                <Share2 size={16} /> Share
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#d4e8c2]/40">
              {[
                { icon: Truck, title: "Free Shipping", desc: "Over ৳7,500" },
                { icon: RotateCcw, title: "Easy Returns", desc: "7-day policy" },
                { icon: ShieldCheck, title: "Authentic", desc: "100% genuine" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <Icon size={18} className="mx-auto mb-2 text-[#66a80f]" />
                  <p className="font-display text-[11px] font-medium text-[#111111]">{title}</p>
                  <p className="text-[10px] text-[#a1a1aa]">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* related */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 border-t border-[#d4e8c2]/40">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <h2 className="font-display text-xl font-semibold text-[#111111] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
