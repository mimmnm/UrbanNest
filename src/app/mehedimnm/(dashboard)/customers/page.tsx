"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, MoreVertical, UserPlus } from "lucide-react";
import { customers } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-stone-900">Customers</h2>
          <p className="text-sm text-stone-500 mt-1">
            Manage your customer base ({customers.length} total)
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors">
          <UserPlus size={16} />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all"
        />
      </div>

      {/* Customer Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, i) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-stone-100 p-6 transition-shadow hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-stone-200 flex items-center justify-center">
                  <span className="text-sm font-semibold text-stone-600">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-stone-900">
                    {customer.name}
                  </h3>
                  <p className="text-xs text-stone-400">{customer.email}</p>
                </div>
              </div>
              <button className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors">
                <MoreVertical size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Orders</p>
                <p className="text-lg font-semibold text-stone-900">
                  {customer.totalOrders}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Total Spent</p>
                <p className="text-lg font-semibold text-stone-900">
                  {formatPrice(customer.totalSpent)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
              <span className="text-xs text-stone-400">
                Joined {new Date(customer.joinDate).toLocaleDateString()}
              </span>
              <button className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors">
                <Mail size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-stone-400">No customers found</p>
        </div>
      )}
    </motion.div>
  );
}
