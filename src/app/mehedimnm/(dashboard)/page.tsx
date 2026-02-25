"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
  };
  recentOrders: Array<{
    id: string;
    orderId: string;
    customer: string;
    email: string;
    items: Array<{ name: string; quantity: number }>;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    reviews: number;
    images: string[];
  }>;
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-stone-400">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: formatPrice(data.stats.totalRevenue), change: data.stats.revenueChange, icon: DollarSign, color: "bg-emerald-50 text-emerald-500" },
    { label: "Total Orders", value: data.stats.totalOrders.toString(), change: data.stats.ordersChange, icon: ShoppingCart, color: "bg-blue-50 text-blue-500" },
    { label: "Total Customers", value: data.stats.totalCustomers.toString(), change: data.stats.customersChange, icon: Users, color: "bg-orange-50 text-orange-500" },
    { label: "Total Products", value: data.stats.totalProducts.toString(), change: 0, icon: Package, color: "bg-stone-100 text-stone-600" },
  ];

  const recentOrders = data.recentOrders || [];
  const topProducts = data.topProducts || [];
  const maxRevenue = Math.max(...(data.monthlyRevenue || []).map((m) => m.revenue), 1);
  const barHeights = (data.monthlyRevenue || []).map((m) => Math.max(Math.round((m.revenue / maxRevenue) * 100), 5));
  while (barHeights.length < 12) barHeights.push(5);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-light text-stone-900">Welcome back</h2>
        <p className="text-sm text-stone-500 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} whileHover={{ y: -2 }} className="bg-white rounded-2xl border border-stone-100 p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon size={18} />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-semibold text-stone-900 mb-1">{stat.value}</p>
            <p className="text-xs text-stone-500">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-stone-900">Revenue Overview</h3>
              <p className="text-xs text-stone-400 mt-0.5">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
              <TrendingUp size={14} />
              Live Data
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {barHeights.map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={`flex-1 rounded-t-lg ${i === barHeights.length - 1 ? "bg-stone-900" : "bg-stone-200 hover:bg-stone-300"} transition-colors cursor-pointer`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-stone-400">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => <span key={m}>{m}</span>)}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6">
          <h3 className="text-sm font-medium text-stone-900 mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No products yet. Add your first product!</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-xs text-stone-400 w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-900 truncate">{product.name}</p>
                    <p className="text-xs text-stone-400">{product.reviews} reviews</p>
                  </div>
                  <span className="text-sm font-medium text-stone-900">{formatPrice(product.price)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-sm font-medium text-stone-900">Recent Orders</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-stone-400">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">Order ID</th>
                  <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">Items</th>
                  <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-stone-900">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-stone-900">{order.customer}</p>
                      <p className="text-xs text-stone-400">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{order.items?.length || 0} item{(order.items?.length || 0) > 1 ? "s" : ""}</td>
                    <td className="px-6 py-4 text-sm font-medium text-stone-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered" ? "bg-emerald-100 text-emerald-700"
                        : order.status === "shipped" ? "bg-blue-100 text-blue-700"
                        : order.status === "processing" ? "bg-yellow-50 text-yellow-700"
                        : order.status === "pending" ? "bg-orange-50 text-orange-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
