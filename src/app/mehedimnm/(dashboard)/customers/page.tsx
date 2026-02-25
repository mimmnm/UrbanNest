"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Loader2, Users } from "lucide-react";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-stone-900">Customers</h2>
        <p className="text-sm text-stone-500 mt-1">Registered users ({total} total)</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all" />
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">{search ? "No customers found" : "No customers yet"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer, i) => (
            <motion.div key={customer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }} className="bg-white rounded-2xl border border-stone-100 p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-stone-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-stone-600">
                      {customer.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-stone-900">{customer.name}</h3>
                    <p className="text-xs text-stone-400">{customer.email}</p>
                  </div>
                </div>
              </div>

              {customer.phone && (
                <p className="text-xs text-stone-500 mb-3">{customer.phone}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <span className="text-xs text-stone-400">
                  Joined {new Date(customer.createdAt).toLocaleDateString()}
                </span>
                <a href={`mailto:${customer.email}`} className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors">
                  <Mail size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
