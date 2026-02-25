"use client";

import { useEffect, useState, useMemo } from "react";
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
  Eye,
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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

  // Process chart data
  const chartData = useMemo(() => {
    if (!data?.monthlyRevenue) return [];
    const now = new Date();
    const months: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = data.monthlyRevenue.find((r) => r._id.year === y && r._id.month === m);
      months.push({
        label: MONTHS[d.getMonth()],
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }
    return months;
  }, [data]);

  const maxRevenue = useMemo(() => Math.max(...chartData.map((m) => m.revenue), 1), [chartData]);
  const totalChartRevenue = useMemo(() => chartData.reduce((s, m) => s + m.revenue, 0), [chartData]);

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
    { label: "Total Revenue", value: formatPrice(data.stats.totalRevenue), change: data.stats.revenueChange, icon: DollarSign, color: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
    { label: "Total Orders", value: data.stats.totalOrders.toString(), change: data.stats.ordersChange, icon: ShoppingCart, color: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
    { label: "Customers", value: data.stats.totalCustomers.toString(), change: data.stats.customersChange, icon: Users, color: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
    { label: "Products", value: data.stats.totalProducts.toString(), change: 0, icon: Package, color: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
  ];

  const recentOrders = data.recentOrders || [];
  const topProducts = data.topProducts || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl sm:text-2xl font-light text-stone-900">Welcome back</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} whileHover={{ y: -2 }} className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.color} ring-4 ${stat.ring} flex items-center justify-center`}>
                <stat.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${stat.change > 0 ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
                  {stat.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-semibold text-stone-900 mb-0.5 truncate">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-stone-500">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Top Products */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <h3 className="text-sm font-medium text-stone-900">Revenue Overview</h3>
              <p className="text-xs text-stone-400 mt-0.5">Last 12 months &middot; Total: {formatPrice(totalChartRevenue)}</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
              <TrendingUp size={12} />
              Live Data
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="relative w-full" style={{ aspectRatio: "2.5/1", minHeight: "160px" }}>
            <svg viewBox="0 0 480 180" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#292524" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#292524" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <line key={pct} x1="0" y1={10 + (1 - pct) * 140} x2="480" y2={10 + (1 - pct) * 140} stroke="#f5f5f4" strokeWidth="1" />
              ))}
              {/* Area fill */}
              <path
                d={(() => {
                  const pts = chartData.map((m, i) => {
                    const x = (i / 11) * 460 + 10;
                    const y = 150 - (m.revenue / maxRevenue) * 140;
                    return `${x},${y}`;
                  });
                  return `M10,150 L${pts.join(" L")} L470,150 Z`;
                })()}
                fill="url(#areaGrad)"
              />
              {/* Line */}
              <polyline
                points={chartData.map((m, i) => {
                  const x = (i / 11) * 460 + 10;
                  const y = 150 - (m.revenue / maxRevenue) * 140;
                  return `${x},${y}`;
                }).join(" ")}
                fill="none"
                stroke="#292524"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {chartData.map((m, i) => {
                const x = (i / 11) * 460 + 10;
                const y = 150 - (m.revenue / maxRevenue) * 140;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={hoveredBar === i ? 6 : 4} fill={hoveredBar === i ? "#292524" : "#fff"} stroke="#292524" strokeWidth="2.5" className="transition-all duration-200 cursor-pointer" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)} />
                    {/* Invisible hit area */}
                    <rect x={x - 20} y={0} width={40} height={170} fill="transparent" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)} />
                  </g>
                );
              })}
            </svg>
            {/* Tooltip */}
            {hoveredBar !== null && chartData[hoveredBar] && (
              <div
                className="absolute pointer-events-none bg-stone-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg z-10 -translate-x-1/2"
                style={{
                  left: `${((hoveredBar / 11) * 100)}%`,
                  top: `${Math.max(5, 100 - (chartData[hoveredBar].revenue / maxRevenue) * 85 - 15)}%`,
                }}
              >
                <p className="font-semibold">{formatPrice(chartData[hoveredBar].revenue)}</p>
                <p className="text-white/60">{chartData[hoveredBar].orders} orders &middot; {chartData[hoveredBar].label}</p>
              </div>
            )}
          </div>
          {/* X labels */}
          <div className="flex justify-between mt-2 px-1">
            {chartData.map((m, i) => (
              <span key={i} className={`text-[9px] sm:text-[10px] ${hoveredBar === i ? "text-stone-900 font-semibold" : "text-stone-400"} transition-colors`}>{m.label}</span>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
          <h3 className="text-sm font-medium text-stone-900 mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-stone-200 text-stone-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-500"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-900 truncate">{product.name}</p>
                    <p className="text-[10px] sm:text-xs text-stone-400">{product.reviews} reviews</p>
                  </div>
                  <span className="text-sm font-semibold text-stone-900 flex-shrink-0">{formatPrice(product.price)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-medium text-stone-900">Recent Orders</h3>
          <a href="/mehedimnm/orders" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
            View all <Eye size={12} />
          </a>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-stone-400">No orders yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left text-[10px] sm:text-xs font-medium text-stone-500 px-4 sm:px-6 py-3">Order ID</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-stone-500 px-4 sm:px-6 py-3">Customer</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-stone-500 px-4 sm:px-6 py-3">Items</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-stone-500 px-4 sm:px-6 py-3">Total</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-stone-500 px-4 sm:px-6 py-3">Status</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-stone-500 px-4 sm:px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-stone-900">{order.orderId}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <p className="text-xs sm:text-sm text-stone-900 truncate max-w-[140px]">{order.customer}</p>
                        <p className="text-[10px] sm:text-xs text-stone-400 truncate max-w-[140px]">{order.email}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-stone-600">{order.items?.length || 0}</td>
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-stone-900">{formatPrice(order.total)}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                          order.status === "delivered" ? "bg-emerald-100 text-emerald-700"
                          : order.status === "shipped" ? "bg-blue-100 text-blue-700"
                          : order.status === "processing" ? "bg-yellow-50 text-yellow-700"
                          : order.status === "pending" ? "bg-orange-50 text-orange-700"
                          : "bg-red-100 text-red-700"
                        }`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-stone-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-stone-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900">{order.orderId}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      order.status === "delivered" ? "bg-emerald-100 text-emerald-700"
                      : order.status === "shipped" ? "bg-blue-100 text-blue-700"
                      : order.status === "processing" ? "bg-yellow-50 text-yellow-700"
                      : order.status === "pending" ? "bg-orange-50 text-orange-700"
                      : "bg-red-100 text-red-700"
                    }`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-600 truncate max-w-[60%]">{order.customer}</p>
                    <p className="text-xs font-semibold text-stone-900">{formatPrice(order.total)}</p>
                  </div>
                  <p className="text-[10px] text-stone-400">{order.items?.length || 0} items &middot; {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
