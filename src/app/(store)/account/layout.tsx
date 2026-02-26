"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { User, Package, Heart, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/account" },
  { icon: Package, label: "My Orders", href: "/account/orders" },
  { icon: Heart, label: "Wishlist", href: "/wishlist" },
  { icon: Settings, label: "Settings", href: "/account/settings" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ avatar?: string; phone?: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setProfile(data.user);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#66a80f]/30 border-t-[#66a80f] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const user = session.user;
  const avatarUrl = profile?.avatar || user.image;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 md:py-14">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-10">
          <p className="font-accent text-[#66a80f] text-base mb-1">welcome back</p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#111111] mb-1">
            My Account
          </h1>
          <p className="text-sm text-[#a1a1aa] font-display">
            Manage your profile, orders, and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6 md:gap-8">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-5 mb-3 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#e8f5d6] flex items-center justify-center mb-3 overflow-hidden ring-3 ring-[#d4e8c2]/30">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={user.name || ""} width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span className="font-display text-2xl font-bold text-[#66a80f]">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <h3 className="font-display text-sm font-semibold text-[#111111]">{user.name || "User"}</h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5">{user.email}</p>
              {profile?.phone && (
                <p className="text-xs text-[#a1a1aa] mt-0.5">{profile.phone}</p>
              )}
            </div>

            {/* Nav */}
            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-2.5">
              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = item.href === "/account"
                    ? pathname === "/account"
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-[#111111] text-white shadow-sm"
                          : "text-[#111111]/70 hover:bg-[#f8f6f3]"
                      }`}
                    >
                      <item.icon size={17} />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              </nav>
            </div>

            {/* Mobile nav */}
            <div className="lg:hidden mt-3 bg-white rounded-2xl border border-[#d4e8c2]/40 p-2">
              <p className="text-[10px] uppercase tracking-wider text-[#a1a1aa] px-3 py-1 font-display">Quick Links</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
