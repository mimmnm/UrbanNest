"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Sparkles, Truck, RotateCcw, Shield, Star, Loader2 } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import type { Product, Category } from "@/lib/data";

/* ── Hero slides ─────────────────────────────────── */
const heroSlides = [
  {
    title: "Discover Your Glow",
    subtitle: "New Season Collection",
    accent: "radiance redefined",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&q=80",
    href: "/products",
  },
  {
    title: "Timeless Elegance",
    subtitle: "Skincare Essentials",
    accent: "pure & natural",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80",
    href: "/products?category=skincare",
  },
  {
    title: "Fragrance Stories",
    subtitle: "Signature Scents",
    accent: "captivating blends",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600&q=80",
    href: "/products?category=fragrances",
  },
];

/* ── Testimonials ────────────────────────────────── */
const testimonials = [
  {
    text: "The quality is beyond anything I expected. My skin feels absolutely incredible.",
    author: "Fatima R.",
    role: "Beauty Enthusiast",
  },
  {
    text: "Finally found a brand that delivers on its promises. The packaging is gorgeous too!",
    author: "Nusrat A.",
    role: "Lifestyle Blogger",
  },
  {
    text: "Every product feels luxurious. This is my go-to shop for all beauty essentials.",
    author: "Tanisha K.",
    role: "Makeup Artist",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, bsRes, naRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?filter=bestseller&limit=8"),
          fetch("/api/products?filter=new&limit=8"),
        ]);
        const catData = catRes.ok ? await catRes.json() : { categories: [] };
        const bsData = bsRes.ok ? await bsRes.json() : { products: [] };
        const naData = naRes.ok ? await naRes.json() : { products: [] };
        setCategories(catData.categories || []);
        setBestSellers(bsData.products || []);
        setNewArrivals(naData.products || []);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative h-[85vh] min-h-[600px] bg-[#111111] overflow-hidden">
        <AnimatePresence mode="wait">
          {heroSlides.map((slide, idx) =>
            idx === currentSlide ? (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 flex items-center">
                  <div className="max-w-xl">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-accent text-[#66a80f] text-lg md:text-xl mb-3"
                    >
                      {slide.accent}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="font-display text-[11px] tracking-[0.3em] uppercase text-white/60 mb-4"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] mb-8"
                    >
                      {slide.title}
                    </motion.h2>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex gap-4"
                    >
                      <Link
                        href={slide.href}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#111111] rounded-full font-display text-sm font-medium tracking-wide hover:bg-[#66a80f] hover:text-white transition-all duration-400"
                      >
                        Shop Now
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-400"
                      >
                        Explore
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Slide Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide
                  ? "w-10 bg-[#66a80f]"
                  : "w-4 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════ TRUST BAR ═══════════ */}
      <section className="py-6 border-b border-[#d4e8c2]/40 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "Free Shipping", desc: "Orders over ৳7,500" },
              { icon: Sparkles, title: "Premium Quality", desc: "100% authentic" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day guarantee" },
              { icon: Shield, title: "Secure Payment", desc: "SSL encrypted" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-full bg-[#f8f6f3] flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-[#66a80f]" />
                </div>
                <div>
                  <p className="font-display text-xs font-semibold text-[#111111] tracking-wide">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#a1a1aa]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="font-accent text-[#66a80f] text-base mb-2">curated for you</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#111111]">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.slice(0, 6).map((cat, idx) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group block relative aspect-[4/5] rounded-2xl overflow-hidden bg-white"
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#f8f6f3] flex items-center justify-center">
                      <span className="font-display text-3xl text-[#d4e8c2]">{cat.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3 className="font-display text-lg md:text-xl font-semibold text-white mb-0.5">
                      {cat.name}
                    </h3>
                    <p className="text-white/60 text-xs font-display tracking-wide">
                      {cat.productCount} products
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BEST SELLERS ═══════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="font-accent text-[#66a80f] text-base mb-2">most loved</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#111111]">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/products?filter=bestseller"
              className="hidden sm:flex items-center gap-1.5 font-display text-sm text-[#111111] hover:text-[#66a80f] transition-colors duration-300"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {bestSellers.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>

          <div className="sm:hidden text-center mt-10">
            <Link
              href="/products?filter=bestseller"
              className="inline-flex items-center gap-2 font-display text-sm text-[#111111] hover:text-[#66a80f] transition-colors"
            >
              View All Best Sellers <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ PROMO BANNER ═══════════ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#111111]" />
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80"
            alt="Promo"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-accent text-[#66a80f] text-xl mb-3">limited time offer</p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-white mb-4 leading-tight">
              25% Off Skincare
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto text-sm">
              Use code <span className="font-accent text-[#66a80f] text-base">GLOW25</span> at checkout.
              Your skin deserves the best.
            </p>
            <Link
              href="/products?category=skincare"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#66a80f] text-white rounded-full font-display text-sm font-medium tracking-wide hover:bg-white hover:text-[#111111] transition-all duration-400"
            >
              Shop Skincare
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ NEW ARRIVALS ═══════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="font-accent text-[#66a80f] text-base mb-2">just dropped</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#111111]">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products?filter=new"
              className="hidden sm:flex items-center gap-1.5 font-display text-sm text-[#111111] hover:text-[#66a80f] transition-colors duration-300"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {newArrivals.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="font-accent text-[#66a80f] text-base mb-2">love letters</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#111111]">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#ffffff] rounded-2xl p-8 text-center"
              >
                <div className="flex justify-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[#66a80f] text-[#66a80f]"
                    />
                  ))}
                </div>
                <p className="text-sm text-[#111111]/70 italic leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="font-display text-sm font-semibold text-[#111111]">
                  {t.author}
                </p>
                <p className="text-xs text-[#a1a1aa] font-display">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ INSTAGRAM ═══════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center mb-10">
          <p className="font-accent text-[#66a80f] text-base mb-2">follow the journey</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#111111] mb-1">
            @urbannest
          </h2>
          <p className="text-sm text-[#a1a1aa]">Tag us in your looks</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 px-1.5">
          {[
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
            "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&q=80",
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
            "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=400&q=80",
          ].map((src, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="block relative aspect-square rounded-xl overflow-hidden img-zoom"
            >
              <Image src={src} alt="Instagram" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300" />
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}