"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Category } from "@/lib/data";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#66a80f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-white py-14 md:py-20 border-b border-[#d4e8c2]/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-accent text-[#66a80f] text-base mb-2"
          >
            browse collections
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-semibold text-[#111111] mb-2"
          >
            Categories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-[#a1a1aa]"
          >
            Explore our curated collections
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-[#a1a1aa]">No categories found.</p>
            </div>
          ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group block relative aspect-[4/5] rounded-2xl overflow-hidden bg-white"
                >
                  {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#d4e8c2] to-[#66a80f]/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-white/60 text-sm font-display">
                      {category.productCount} products
                    </p>
                  </div>
                  <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-90">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
