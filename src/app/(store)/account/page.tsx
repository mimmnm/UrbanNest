"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Package, MapPin, Phone, Calendar, ChevronRight, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderSummary {
  orderId: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; image: string; quantity: number }[];
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  city: string;
  district: string;
  createdAt: string;
}

export default function AccountOverviewPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, delivered: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [phoneWarning, setPhoneWarning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/orders"),
        ]);
        if (profileRes.ok) {
          const pd = await profileRes.json();
          setProfile(pd.user);
          if (!pd.user.phone) setPhoneWarning(true);
        }
        if (ordersRes.ok) {
          const od = await ordersRes.json();
          const orders = od.orders || [];
          setRecentOrders(orders.slice(0, 3));
          setOrderStats({
            total: orders.length,
            pending: orders.filter((o: OrderSummary) => o.status === "pending" || o.status === "processing").length,
            delivered: orders.filter((o: OrderSummary) => o.status === "delivered").length,
            totalSpent: orders.reduce((s: number, o: OrderSummary) => s + o.total, 0),
          });
        }
      } catch (err) {
        console.error("Failed to load account data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[#66a80f]/30 border-t-[#66a80f] rounded-full animate-spin" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-5">
      {/* Phone warning */}
      {phoneWarning && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">মোবাইল নম্বর যোগ করুন</p>
            <p className="text-xs text-amber-600 mt-0.5">অর্ডার ডেলিভারির জন্য আপনার মোবাইল নম্বর আবশ্যক।</p>
          </div>
          <Link href="/account/settings" className="text-xs font-medium text-amber-700 hover:text-amber-900 underline shrink-0">
            Update
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: orderStats.total, color: "text-[#66a80f]" },
          { label: "Pending", value: orderStats.pending, color: "text-amber-600" },
          { label: "Delivered", value: orderStats.delivered, color: "text-emerald-600" },
          { label: "Total Spent", value: formatPrice(orderStats.totalSpent), color: "text-blue-600" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-[#d4e8c2]/40 p-4"
          >
            <p className="text-[11px] font-display text-[#a1a1aa] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Info */}
      <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-[#111111]">Profile Summary</h2>
          <Link href="/account/settings" className="text-xs font-display text-[#66a80f] hover:underline">Edit</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-[#f8f6f3] rounded-xl">
            <Phone size={16} className="text-[#66a80f] shrink-0" />
            <div>
              <p className="text-[10px] font-display text-[#a1a1aa] uppercase tracking-wider">Phone</p>
              <p className="text-sm font-display text-[#111111]">{profile?.phone || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#f8f6f3] rounded-xl">
            <MapPin size={16} className="text-[#66a80f] shrink-0" />
            <div>
              <p className="text-[10px] font-display text-[#a1a1aa] uppercase tracking-wider">Address</p>
              <p className="text-sm font-display text-[#111111] truncate">
                {[profile?.address, profile?.city, profile?.district].filter(Boolean).join(", ") || "Not set"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#f8f6f3] rounded-xl">
            <Calendar size={16} className="text-[#66a80f] shrink-0" />
            <div>
              <p className="text-[10px] font-display text-[#a1a1aa] uppercase tracking-wider">Member Since</p>
              <p className="text-sm font-display text-[#111111]">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-[#d4e8c2]/40 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-[#111111]">Recent Orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs font-display text-[#66a80f] hover:underline">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-10">
            <Package size={32} className="mx-auto text-[#d4e8c2] mb-3" />
            <p className="text-sm text-[#a1a1aa] font-display">No orders yet</p>
            <Link href="/products" className="inline-block mt-3 text-xs font-display text-[#66a80f] hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.orderId} className="flex items-center gap-4 p-3 bg-[#f8f6f3] rounded-xl">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-white">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#e8f5d6] flex items-center justify-center text-[8px] font-display text-[#66a80f]">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-medium text-[#111111]">{order.orderId}</p>
                  <p className="text-[11px] text-[#a1a1aa]">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-display font-medium uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  <p className="font-display text-sm font-semibold text-[#111111] mt-1">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
