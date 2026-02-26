"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Package, ChevronDown, ChevronUp, MapPin, Phone,
  CreditCard, Truck, CheckCircle2, Clock, XCircle, RotateCcw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  name: string;
  image: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface Order {
  id: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    district: string;
    zipCode: string;
  };
  phone: string;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  pending: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock, label: "Pending" },
  processing: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: RotateCcw, label: "Processing" },
  shipped: { color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: Truck, label: "Shipped" },
  delivered: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, label: "Delivered" },
  cancelled: { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle, label: "Cancelled" },
};

const paymentColors: Record<string, string> = {
  unpaid: "text-amber-600 bg-amber-50",
  paid: "text-emerald-600 bg-emerald-50",
  refunded: "text-red-600 bg-red-50",
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[#66a80f]/30 border-t-[#66a80f] rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const statusCounts = orders.reduce((a, o) => {
    a[o.status] = (a[o.status] || 0) + 1;
    return a;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All", count: orders.length },
          { key: "pending", label: "Pending", count: statusCounts.pending || 0 },
          { key: "processing", label: "Processing", count: statusCounts.processing || 0 },
          { key: "shipped", label: "Shipped", count: statusCounts.shipped || 0 },
          { key: "delivered", label: "Delivered", count: statusCounts.delivered || 0 },
          { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled || 0 },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition ${
              filter === f.key
                ? "bg-[#111] text-white"
                : "bg-white border border-[#d4e8c2]/40 text-[#555] hover:bg-[#f8f6f3]"
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold ${
                filter === f.key ? "bg-white/20 text-white" : "bg-[#f0f0f0] text-[#777]"
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#d4e8c2]/40">
          <Package size={40} className="mx-auto text-[#d4e8c2] mb-3" />
          <p className="text-sm font-display text-[#a1a1aa] mb-3">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </p>
          {filter === "all" && (
            <Link href="/products" className="inline-block text-xs font-display text-[#66a80f] hover:underline">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const isExpanded = expandedId === order.id;
            const sc = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-[#d4e8c2]/40 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-[#fafaf8] transition"
                >
                  <div className="flex -space-x-2 shrink-0">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-[#f8f6f3]">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-display text-[#66a80f] bg-[#e8f5d6]">
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-[#e8f5d6] flex items-center justify-center text-[10px] font-display font-bold text-[#66a80f]">
                        +{order.items.length - 2}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display text-sm font-medium text-[#111]">{order.orderId}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-medium border ${sc.bg} ${sc.color}`}>
                        <StatusIcon size={10} /> {sc.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{order.items.reduce((s, it) => s + it.quantity, 0)} items
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-sm font-semibold text-[#111]">{formatPrice(order.total)}</p>
                    <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-display font-medium ${paymentColors[order.paymentStatus] || "text-gray-500 bg-gray-50"}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-[#a1a1aa] shrink-0" /> : <ChevronDown size={16} className="text-[#a1a1aa] shrink-0" />}
                </button>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#d4e8c2]/30 p-4 md:p-5 space-y-4">
                        {/* Status Timeline */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {["pending", "processing", "shipped", "delivered"].map((step, idx) => {
                            const stepIdx = ["pending", "processing", "shipped", "delivered"].indexOf(order.status);
                            const isActive = idx <= stepIdx && order.status !== "cancelled";
                            const isCancelled = order.status === "cancelled";
                            return (
                              <div key={step} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isCancelled ? "bg-red-100 text-red-400" : isActive ? "bg-[#66a80f] text-white" : "bg-[#f0f0f0] text-[#ccc]"
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[10px] font-display capitalize whitespace-nowrap ${
                                  isCancelled ? "text-red-400" : isActive ? "text-[#111] font-medium" : "text-[#ccc]"
                                }`}>
                                  {step}
                                </span>
                                {idx < 3 && <div className={`w-6 h-[2px] ${isActive && idx < stepIdx ? "bg-[#66a80f]" : "bg-[#eee]"}`} />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-[#f8f6f3] rounded-xl">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#e8f5d6] text-xs font-display text-[#66a80f]">
                                    {item.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-display font-medium text-[#111] truncate">{item.name}</p>
                                {item.variant && <p className="text-[11px] text-[#a1a1aa]">{item.variant}</p>}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs text-[#a1a1aa]">×{item.quantity}</p>
                                <p className="text-sm font-display font-semibold text-[#111]">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Grid */}
                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                          {/* Shipping Address */}
                          <div className="p-3 bg-[#f8f6f3] rounded-xl">
                            <div className="flex items-center gap-1.5 mb-2">
                              <MapPin size={12} className="text-[#66a80f]" />
                              <p className="text-[10px] font-display text-[#a1a1aa] uppercase tracking-wider">Shipping Address</p>
                            </div>
                            <p className="text-xs text-[#111] font-display leading-relaxed">
                              {order.shippingAddress?.fullName}<br />
                              {order.shippingAddress?.address}<br />
                              {[order.shippingAddress?.city, order.shippingAddress?.district, order.shippingAddress?.zipCode].filter(Boolean).join(", ")}
                            </p>
                            {order.phone && (
                              <p className="flex items-center gap-1 text-xs text-[#a1a1aa] mt-1">
                                <Phone size={10} /> {order.phone}
                              </p>
                            )}
                          </div>

                          {/* Payment Summary */}
                          <div className="p-3 bg-[#f8f6f3] rounded-xl">
                            <div className="flex items-center gap-1.5 mb-2">
                              <CreditCard size={12} className="text-[#66a80f]" />
                              <p className="text-[10px] font-display text-[#a1a1aa] uppercase tracking-wider">Payment</p>
                            </div>
                            <div className="space-y-1 text-xs font-display">
                              <div className="flex justify-between text-[#555]">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-[#555]">
                                <span>Shipping</span>
                                <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
                              </div>
                              <div className="flex justify-between font-semibold text-[#111] pt-1 border-t border-[#e0e0e0]/50">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                              </div>
                              <p className="text-[10px] text-[#a1a1aa] pt-1 capitalize">Method: {order.paymentMethod}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
