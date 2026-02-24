"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { dashboardStats, orders, products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stats = [
  {
    label: "Total Revenue",
    value: formatPrice(dashboardStats.totalRevenue),
    change: dashboardStats.revenueGrowth,
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-500",
  },
  {
    label: "Total Orders",
    value: dashboardStats.totalOrders.toString(),
    change: dashboardStats.ordersGrowth,
    icon: ShoppingCart,
    color: "bg-blue-50 text-blue-500",
  },
  {
    label: "Total Customers",
    value: dashboardStats.totalCustomers.toString(),
    change: dashboardStats.customersGrowth,
    icon: Users,
    color: "bg-orange-50 text-orange-500",
  },
  {
    label: "Total Products",
    value: dashboardStats.totalProducts.toString(),
    change: dashboardStats.productsGrowth,
    icon: Package,
    color: "bg-stone-100 text-stone-600",
  },
];

export default function AdminDashboard() {
  const recentOrders = orders.slice(0, 5);
  const topProducts = products.slice(0, 5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-light text-stone-900">Welcome back, Mehedi</h2>
        <p className="text-sm text-stone-500 mt-1">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-stone-100 p-5 transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon size={18} />
              </div>
              {stat.change !== 0 && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.change > 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {stat.change > 0 ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-semibold text-stone-900 mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-stone-500">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Placeholder + Recent Orders */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Revenue Chart Placeholder */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-stone-900">Revenue Overview</h3>
              <p className="text-xs text-stone-400 mt-0.5">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
              <TrendingUp size={14} />
              +12.5%
            </div>
          </div>
          {/* Bar Chart */}
          <div className="flex items-end gap-2 h-48">
            {[40, 65, 50, 72, 58, 80, 68, 90, 75, 95, 85, 100].map(
              (height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={`flex-1 rounded-t-lg ${
                    i === 11 ? "bg-stone-900" : "bg-stone-200 hover:bg-stone-300"
                  } transition-colors cursor-pointer`}
                />
              )
            )}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-stone-400">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
              (m) => (
                <span key={m}>{m}</span>
              )
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6"
        >
          <h3 className="text-sm font-medium text-stone-900 mb-4">
            Top Products
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-xs text-stone-400 w-5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {product.reviews} sales
                  </p>
                </div>
                <span className="text-sm font-medium text-stone-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-sm font-medium text-stone-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">
                  Order ID
                </th>
                <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">
                  Items
                </th>
                <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-stone-500 px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-stone-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-stone-900">
                        {order.customer}
                      </p>
                      <p className="text-xs text-stone-400">
                        {order.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {order.items} item
                    {order.items > 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-stone-900">
                    {formatPrice(order.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "processing"
                          ? "bg-yellow-50 text-yellow-700"
                          : order.status === "pending"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
