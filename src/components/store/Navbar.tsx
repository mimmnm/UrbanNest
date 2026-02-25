"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Heart, Menu, X, ChevronRight, LogIn, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/data";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/products?filter=new", label: "New In" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

interface StoreInfo {
  storeName: string;
  logo: string;
  freeShippingMin: number;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({ storeName: "UrbanNest", logo: "", freeShippingMin: 7500 });
  const { totalItems } = useCart();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, settingsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/settings"),
        ]);
        const catData = await catRes.json();
        setCategories(catData.categories || []);
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setStoreInfo({
            storeName: s.storeName || "UrbanNest",
            logo: s.logo || "",
            freeShippingMin: s.freeShippingMin ?? 7500,
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  // Split store name for coloring
  const nameParts = storeInfo.storeName.match(/^(Urban)(Nest)$/i);
  const nameFirst = nameParts ? nameParts[1] : storeInfo.storeName;
  const nameSecond = nameParts ? nameParts[2] : "";

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#111111] text-white text-center py-2 sm:py-2.5 px-4 text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-display leading-relaxed">
        Free shipping on orders over ৳{storeInfo.freeShippingMin.toLocaleString()} &mdash;{" "}
        <span className="font-accent text-[#66a80f] text-xs sm:text-sm normal-case tracking-normal">GLOW15</span>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled ? "glass shadow-sm" : "bg-white"}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[68px] lg:h-[72px]">
            {/* Left */}
            <div className="flex items-center gap-6 lg:gap-10 min-w-0">
              <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-2 -ml-2 text-[#111111] hover:text-[#66a80f] active:scale-95 transition-all" aria-label="Toggle menu">
                <AnimatePresence mode="wait">
                  {isMobileOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={22} /></motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={22} /></motion.div>
                  )}
                </AnimatePresence>
              </button>
              <div className="hidden lg:flex items-center gap-7 xl:gap-9">
                {navLinks.map((link) => (
                  <Link key={link.label} href={link.href} className={`font-display text-[13px] tracking-[0.06em] uppercase transition-colors duration-300 link-underline ${pathname === link.href ? "text-[#66a80f] font-semibold" : "text-[#111111] hover:text-[#66a80f]"}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center: Logo + Name */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 shrink-0 flex items-center gap-2">
              {storeInfo.logo && (
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={storeInfo.logo} alt="Logo" fill className="object-contain" sizes="36px" />
                </div>
              )}
              <h1 className="font-display text-[22px] sm:text-[26px] lg:text-[30px] font-semibold tracking-[0.03em] text-[#111111] whitespace-nowrap">
                {nameSecond ? (<>{nameFirst}<span className="text-[#66a80f]">{nameSecond}</span></>) : storeInfo.storeName}
              </h1>
            </Link>

            {/* Right */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button onClick={() => { setIsSearchOpen(!isSearchOpen); setIsMobileOpen(false); }} className="p-2 sm:p-2.5 text-[#111111] hover:text-[#66a80f] active:scale-95 transition-all" aria-label="Search">
                <Search size={19} strokeWidth={1.5} />
              </button>
              <Link href="/wishlist" className="hidden md:flex p-2.5 text-[#111111] hover:text-[#66a80f] transition-colors duration-300" aria-label="Wishlist">
                <Heart size={19} strokeWidth={1.5} />
              </Link>
              <Link href="/cart" className="relative p-2 sm:p-2.5 text-[#111111] hover:text-[#66a80f] transition-colors duration-300" aria-label="Cart">
                <ShoppingBag size={19} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-0 right-0 sm:-top-0.5 sm:-right-0.5 w-[18px] h-[18px] bg-[#66a80f] text-white text-[9px] font-display font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                    {totalItems}
                  </motion.span>
                )}
              </Link>
              {isLoggedIn ? (
                <Link href="/account" className="hidden sm:flex p-2.5 text-[#66a80f] hover:text-[#111111] transition-colors duration-300" aria-label="Account">
                  <User size={19} strokeWidth={1.5} />
                </Link>
              ) : (
                <Link href="/login" className="hidden sm:flex p-2.5 text-[#111111] hover:text-[#66a80f] transition-colors duration-300" aria-label="Login">
                  <LogIn size={19} strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="border-t border-[#d4e8c2]/50 overflow-hidden">
                <div className="py-4 sm:py-5">
                  <form className="relative max-w-xl mx-auto" onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setIsSearchOpen(false); setSearchQuery(""); } }}>
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
                    <input type="text" placeholder="Search for products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-[#f8f6f3] border border-[#d4e8c2] rounded-full text-sm font-display focus:outline-none focus:border-[#66a80f] focus:ring-1 focus:ring-[#66a80f]/20 transition-all placeholder:text-[#a1a1aa]" autoFocus />
                    <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a1a1aa] hover:text-[#111111] transition-colors" aria-label="Close search"><X size={16} /></button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="lg:hidden fixed inset-0 top-[calc(theme(spacing.16)+37px)] sm:top-[calc(theme(spacing.[68px])+37px)] z-40">
              <div className="absolute inset-0 bg-black/20" onClick={closeMobile} />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="relative w-[85%] max-w-sm h-full bg-white shadow-2xl overflow-y-auto">
                <div className="px-6 py-8">
                  <div className="space-y-1">
                    {navLinks.map((link, i) => (
                      <motion.div key={link.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <Link href={link.href} onClick={closeMobile} className={`flex items-center justify-between py-3.5 font-display text-base tracking-wide transition-colors ${pathname === link.href ? "text-[#66a80f] font-semibold" : "text-[#111111] hover:text-[#66a80f]"}`}>
                          {link.label}
                          <ChevronRight size={16} className="text-[#a1a1aa]" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <div className="pt-7 mt-6 border-t border-[#d4e8c2]/60">
                    <p className="text-[10px] font-display tracking-[0.2em] uppercase text-[#a1a1aa] font-semibold mb-4">Categories</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                      {categories.map((cat) => (
                        <Link key={cat.slug} href={`/products?category=${cat.slug}`} onClick={closeMobile} className="text-sm text-[#555] hover:text-[#66a80f] py-1 transition-colors">{cat.name}</Link>
                      ))}
                    </div>
                  </div>
                  <div className="pt-7 mt-6 border-t border-[#d4e8c2]/60 space-y-1">
                    {isLoggedIn ? (
                      <>
                        {[
                          { href: "/account", icon: User, label: "My Account" },
                          { href: "/wishlist", icon: Heart, label: "Wishlist" },
                          { href: "/cart", icon: ShoppingBag, label: "Cart", badge: totalItems },
                        ].map(({ href, icon: Icon, label, badge }) => (
                          <Link key={label} href={href} onClick={closeMobile} className="flex items-center justify-between py-3 text-sm font-display text-[#111111] hover:text-[#66a80f] transition-colors">
                            <span className="flex items-center gap-3"><Icon size={18} strokeWidth={1.5} />{label}</span>
                            {badge ? <span className="w-5 h-5 bg-[#66a80f] text-white text-[10px] font-bold flex items-center justify-center rounded-full">{badge}</span> : null}
                          </Link>
                        ))}
                        <button onClick={() => { closeMobile(); signOut(); }} className="flex items-center gap-3 py-3 text-sm font-display text-red-500 hover:text-red-600 transition-colors w-full">
                          <LogOut size={18} strokeWidth={1.5} />Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={closeMobile} className="flex items-center gap-3 py-3 text-sm font-display text-[#111111] hover:text-[#66a80f] transition-colors"><LogIn size={18} strokeWidth={1.5} />Sign In</Link>
                        <Link href="/signup" onClick={closeMobile} className="flex items-center gap-3 py-3 text-sm font-display text-[#66a80f] font-medium transition-colors"><User size={18} strokeWidth={1.5} />Create Account</Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
