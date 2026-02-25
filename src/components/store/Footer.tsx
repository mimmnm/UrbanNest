"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Leaf,
  Truck,
  ShieldCheck,
  Heart,
} from "lucide-react";

const footerLinks = {
  shop: [
    { name: "New Arrivals", href: "/products?filter=new" },
    { name: "Best Sellers", href: "/products?filter=bestseller" },
    { name: "Skincare", href: "/products?category=skincare" },
    { name: "Makeup", href: "/products?category=makeup" },
    { name: "Fragrances", href: "/products?category=fragrances" },
  ],
  help: [
    { name: "Contact Us", href: "/contact" },
    { name: "My Account", href: "/account" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Cart", href: "/cart" },
  ],
  about: [
    { name: "Our Story", href: "/about" },
    { name: "All Products", href: "/products" },
    { name: "Categories", href: "/categories" },
  ],
};

const trustFeatures = [
  { icon: Truck, label: "Free Shipping", desc: "Orders over ৳7,500" },
  { icon: ShieldCheck, label: "100% Authentic", desc: "Guaranteed genuine" },
  { icon: Leaf, label: "Eco Packaging", desc: "Sustainable wrapping" },
  { icon: Heart, label: "Made with Love", desc: "Curated collections" },
];

export default function Footer() {
  const [nlEmail, setNlEmail] = useState("");
  const [nlSubmitted, setNlSubmitted] = useState(false);

  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* ── Trust Bar ─────────────────────────── */}
      <div className="bg-[#f8f6f3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#66a80f]/8 flex items-center justify-center group-hover:bg-[#66a80f]/15 group-hover:scale-105 transition-all duration-300">
                  <Icon size={20} className="text-[#66a80f]" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-[#111111]">{label}</p>
                  <p className="text-xs text-[#a1a1aa]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter CTA ────────────────────── */}
      <div className="relative bg-[#111111] overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#66a80f]/6 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#66a80f]/4 blur-3xl" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left max-w-lg">
              <p className="font-accent text-[#66a80f] text-lg mb-1">stay in the loop</p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
                Join the UrbanNest Family
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Get 10% off your first order, plus early access to new arrivals and exclusive beauty tips.
              </p>
            </div>
            <form className="flex w-full max-w-md" onSubmit={(e) => { e.preventDefault(); if (nlEmail.trim()) setNlSubmitted(true); }}>
              {nlSubmitted ? (
                <p className="text-[#66a80f] font-display text-sm font-medium py-4">Thank you for subscribing! 🎉</p>
              ) : (
                <>
              <input
                type="email"
                placeholder="Your email address"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-white/10 border border-white/10 rounded-l-full text-sm text-white focus:outline-none focus:border-[#66a80f]/60 focus:bg-white/15 transition-all duration-300 placeholder:text-white/30"
              />
              <button
                type="submit"
                className="px-7 bg-[#66a80f] text-white rounded-r-full hover:bg-[#5a9a0d] transition-all duration-300 flex items-center gap-2 font-display text-sm font-medium group"
              >
                <span className="hidden sm:inline">Subscribe</span>
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ───────────────── */}
      <div className="bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 lg:gap-16">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4">
              <Link href="/" className="inline-block mb-5">
                <span className="font-display text-2xl font-semibold text-white">
                  Urban<span className="text-[#66a80f]">Nest</span>
                </span>
              </Link>
              <p className="text-sm text-white/60 mb-7 leading-relaxed max-w-xs">
                Curated beauty & lifestyle essentials for the modern soul. Experience the art of mindful living.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: MapPin, text: "Gulshan 2, Dhaka 1212" },
                  { icon: Phone, text: "+880 1700-000000" },
                  { icon: Mail, text: "hello@urbannest.com.bd" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 group">
                    <Icon size={14} className="text-[#66a80f] group-hover:text-[#66a80f] transition-colors" />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">{text}</span>
                  </div>
                ))}
              </div>

              {/* Social Icons */}
              <div className="flex gap-3">
                {[
                  { icon: Instagram, label: "Instagram" },
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#66a80f]/15 hover:text-[#66a80f] transition-all duration-300 hover:scale-105"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-display text-xs uppercase tracking-[0.2em] text-white font-semibold mb-6 relative">
                Shop
                <span className="absolute -bottom-2 left-0 w-6 h-0.5 bg-[#66a80f] rounded-full" />
              </h4>
              <ul className="space-y-3.5">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-[#66a80f] hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="font-display text-xs uppercase tracking-[0.2em] text-white font-semibold mb-6 relative">
                Support
                <span className="absolute -bottom-2 left-0 w-6 h-0.5 bg-[#66a80f] rounded-full" />
              </h4>
              <ul className="space-y-3.5">
                {footerLinks.help.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-[#66a80f] hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="font-display text-xs uppercase tracking-[0.2em] text-white font-semibold mb-6 relative">
                Company
                <span className="absolute -bottom-2 left-0 w-6 h-0.5 bg-[#66a80f] rounded-full" />
              </h4>
              <ul className="space-y-3.5">
                {footerLinks.about.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-[#66a80f] hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Payment badge */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[11px] uppercase tracking-widest text-white/50 mb-3 font-display">We Accept</p>
                <div className="flex gap-2">
                  {["bKash", "Nagad", "Visa", "Master"].map((m) => (
                    <span key={m} className="px-2.5 py-1 text-[11px] font-display font-medium bg-white/10 text-white/70 rounded-md">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Bar ──────────────────────── */}
          <div className="mt-14 pt-7 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/50">
                © {new Date().getFullYear()} UrbanNest. Crafted with{" "}
                <Heart size={10} className="inline text-[#66a80f] fill-[#66a80f]" /> in Dhaka, Bangladesh
              </p>
              <div className="flex items-center gap-6">
                {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((item) => (
                  <span
                    key={item}
                    className="text-[11px] text-white/50 hover:text-white/80 transition-colors duration-300 cursor-pointer"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}