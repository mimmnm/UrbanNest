"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, Grid2X2, X, Loader2 } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import type { Product, Category } from "@/lib/data";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#66a80f]" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const searchParam = searchParams.get("search");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [sortBy, setSortBy] = useState(filterParam === "new" ? "newest" : "featured");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);

  // Sync selectedCategory when URL changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams();
        params.set("limit", "100");
        if (searchParam) params.set("search", searchParam);
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?${params}`),
          fetch("/api/categories"),
        ]);
        if (!prodRes.ok || !catRes.ok) throw new Error("Failed to fetch");
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData.products || []);
        setCategories(catData.categories || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchParam]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    switch (sortBy) {
      case "featured":
        result.sort((a, b) => {
          const af = a.featured || a.isBestSeller ? 1 : 0;
          const bf = b.featured || b.isBestSeller ? 1 : 0;
          return bf - af;
        });
        break;
      case "newest":
        result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
    }
    return result;
  }, [products, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#66a80f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="bg-white py-14 md:py-20 border-b border-[#d4e8c2]/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-accent text-[#66a80f] text-base mb-2">
            explore our collection
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-3xl md:text-4xl font-semibold text-[#111111] mb-2">
            {selectedCategory ? categories.find((c) => c.slug === selectedCategory)?.name : "All Products"}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-sm text-[#a1a1aa] font-display">
            {filteredProducts.length} products
          </motion.p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between mb-10 pb-5 border-b border-[#d4e8c2]/40">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 font-display text-sm text-[#111111] hover:text-[#66a80f] transition-colors">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1.5">
                <button onClick={() => setGridCols(3)} className={`p-1.5 rounded-lg ${gridCols === 3 ? "text-[#66a80f] bg-[#66a80f]/10" : "text-[#a1a1aa]"}`}>
                  <Grid2X2 size={18} />
                </button>
                <button onClick={() => setGridCols(4)} className={`p-1.5 rounded-lg ${gridCols === 4 ? "text-[#66a80f] bg-[#66a80f]/10" : "text-[#a1a1aa]"}`}>
                  <Grid3X3 size={18} />
                </button>
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="font-display text-sm text-[#111111] bg-transparent border border-[#d4e8c2] rounded-full px-4 py-2 focus:outline-none focus:border-[#66a80f] cursor-pointer">
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-10">
            <motion.aside initial={false} animate={{ width: showFilters ? 220 : 0, opacity: showFilters ? 1 : 0 }} className="hidden lg:block overflow-hidden flex-shrink-0">
              <div className="w-[220px] pr-8">
                <h3 className="font-display text-[11px] uppercase tracking-[0.2em] text-[#111111] font-semibold mb-5">Categories</h3>
                <ul className="space-y-2.5">
                  <li>
                    <button onClick={() => setSelectedCategory(null)} className={`font-display text-sm transition-colors ${!selectedCategory ? "text-[#66a80f] font-medium" : "text-[#a1a1aa] hover:text-[#111111]"}`}>
                      All Products
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <button onClick={() => setSelectedCategory(cat.slug)} className={`font-display text-sm transition-colors ${selectedCategory === cat.slug ? "text-[#66a80f] font-medium" : "text-[#a1a1aa] hover:text-[#111111]"}`}>
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
                {selectedCategory && (
                  <button onClick={() => setSelectedCategory(null)} className="mt-6 font-display text-xs text-[#66a80f] hover:underline">Clear filters</button>
                )}
              </div>
            </motion.aside>

            <div className="flex-1">
              {selectedCategory && (
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => setSelectedCategory(null)} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#f8f6f3] rounded-full font-display text-sm text-[#111111]">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className={`grid gap-5 md:gap-7 ${gridCols === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
                {filteredProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="font-display text-[#a1a1aa]">No products found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
