"use client";

import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { CartProvider } from "@/lib/cart-context";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#ffffff]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
