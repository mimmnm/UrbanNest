"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { User, Package, Heart, Settings, LogOut, Mail } from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-accent text-[#66a80f] text-base mb-1">welcome back</p>
          <h1 className="font-display text-3xl font-semibold text-[#111111] mb-2">
            My Account
          </h1>
          <p className="text-sm text-[#a1a1aa] font-display mb-10">
            Manage your account settings and view orders
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* User Avatar Card */}
            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-6 mb-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#e8f5d6] flex items-center justify-center mb-3 overflow-hidden">
                {user.image ? (
                  <Image src={user.image} alt={user.name || ""} width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span className="font-display text-2xl font-bold text-[#66a80f]">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <h3 className="font-display text-sm font-semibold text-[#111111]">
                {user.name || "User"}
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5">{user.email}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-3">
              <nav className="space-y-1">
                {[
                  { icon: User, label: "Profile", active: true, href: "/account" },
                  { icon: Package, label: "Orders", href: "/account" },
                  { icon: Heart, label: "Wishlist", href: "/wishlist" },
                  { icon: Settings, label: "Settings", href: "/account" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-display text-sm transition-colors duration-200 ${
                      item.active
                        ? "bg-[#111111] text-white"
                        : "text-[#111111]/70 hover:bg-[#f8f6f3]"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-display text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-8">
              <h2 className="font-display text-lg font-semibold text-[#111111] mb-7">
                Profile Information
              </h2>

              <div className="space-y-5">
                {/* Name */}
                <div className="flex items-start gap-4 p-4 bg-[#f8f6f3] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#e8f5d6] flex items-center justify-center shrink-0">
                    <User size={18} className="text-[#66a80f]" />
                  </div>
                  <div>
                    <p className="text-xs font-display text-[#a1a1aa] uppercase tracking-wider mb-1">Full Name</p>
                    <p className="font-display text-sm font-medium text-[#111111]">
                      {user.name || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-4 bg-[#f8f6f3] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#e8f5d6] flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-[#66a80f]" />
                  </div>
                  <div>
                    <p className="text-xs font-display text-[#a1a1aa] uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-display text-sm font-medium text-[#111111]">
                      {user.email || "Not set"}
                    </p>
                  </div>
                </div>


              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
