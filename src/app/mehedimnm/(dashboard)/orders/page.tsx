"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { orders } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: "bg-orange-50 text-orange-700 border-orange-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light text-stone-900">Orders</h2>
        <p className="text-sm text-stone-500 mt-1">
          Track and manage customer orders ({orders.length} total)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "processing", "shipped", "delivered"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                  statusFilter === status
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order, i) => {
          const StatusIcon = statusIcons[order.status];
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      statusColors[order.status].split(" ").slice(0, 1).join(" ")
                    }`}
                  >
                    <StatusIcon
                      size={18}
                      className={
                        statusColors[order.status].split(" ").slice(1, 2).join(" ")
                      }
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-stone-900">
                        {order.id}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                      {order.customer} · {order.email}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {order.items} items
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 lg:text-right">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">
                      {formatPrice(order.amount)}
                    </p>
                    <p className="text-xs text-stone-400">
                      {order.items} item{order.items > 1 ? "s" : ""}
                      {" · "}
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors">
                    <Eye size={18} />
                  </button>
                </div>
              </div>

              {/* Items Preview */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-stone-50 text-stone-600 px-3 py-1.5 rounded-lg">
                    {order.items} item(s) - ${order.amount}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-stone-400">No orders found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
