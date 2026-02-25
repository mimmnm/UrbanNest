"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  id: string;
  _id?: string;
  orderId: string;
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
  createdAt: string;
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: "bg-orange-50 text-orange-700 border-orange-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Debounced search/filter
  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => ((o.id || o._id) === orderId ? { ...o, ...data.order } : o)));
        if (selectedOrder && (selectedOrder.id || selectedOrder._id) === orderId) {
          setSelectedOrder({ ...selectedOrder, ...data.order });
        }
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

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
        <h2 className="text-2xl font-light text-stone-900">Orders</h2>
        <p className="text-sm text-stone-500 mt-1">Track and manage customer orders ({orders.length} total)</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-xl text-sm transition-all border ${statusFilter === status ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const oid = order.id || order._id || "";
            const StatusIcon = statusIcons[order.status] || Clock;
            return (
              <motion.div key={oid} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusColors[order.status]?.split(" ").slice(0, 1).join(" ") || "bg-stone-50"}`}>
                      <StatusIcon size={18} className={statusColors[order.status]?.split(" ").slice(1, 2).join(" ") || "text-stone-500"} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-sm font-semibold text-stone-900">{order.orderId}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status] || ""}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : order.paymentStatus === "refunded" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 mt-1">{order.customer} · {order.email}</p>
                      {order.phone && <p className="text-xs text-stone-400">{order.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:text-right">
                    <div>
                      <p className="text-lg font-semibold text-stone-900">{formatPrice(order.total)}</p>
                      <p className="text-xs text-stone-400">{order.items?.length || 0} items · {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <select value={order.status} onChange={(e) => handleStatusChange(oid, e.target.value)} disabled={updatingStatus} className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-stone-300">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors">
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-stone-50 text-stone-600 px-3 py-1.5 rounded-lg">
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h3 className="text-lg font-medium text-stone-900">Order {selectedOrder.orderId}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-stone-400 hover:text-stone-900"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Customer</p>
                    <p className="text-sm font-medium text-stone-900">{selectedOrder.customer}</p>
                    <p className="text-xs text-stone-500">{selectedOrder.email}</p>
                    {selectedOrder.phone && <p className="text-xs text-stone-500">{selectedOrder.phone}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Shipping Address</p>
                    <p className="text-sm text-stone-700">{selectedOrder.shippingAddress || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                        <div>
                          <p className="text-sm text-stone-900">{item.name}</p>
                          <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-stone-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-stone-500">Subtotal</span><span className="text-stone-900">{formatPrice(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-stone-500">Shipping</span><span className="text-stone-900">{selectedOrder.shipping === 0 ? "Free" : formatPrice(selectedOrder.shipping)}</span></div>
                  <div className="flex justify-between text-sm font-semibold border-t border-stone-200 pt-2"><span className="text-stone-900">Total</span><span className="text-stone-900">{formatPrice(selectedOrder.total)}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-stone-400 mb-1">Payment</p><p className="text-sm text-stone-700 capitalize">{selectedOrder.paymentMethod}</p></div>
                  <div><p className="text-xs text-stone-400 mb-1">Payment Status</p><p className="text-sm text-stone-700 capitalize">{selectedOrder.paymentStatus}</p></div>
                </div>
                {selectedOrder.notes && (
                  <div><p className="text-xs text-stone-400 mb-1">Notes</p><p className="text-sm text-stone-700">{selectedOrder.notes}</p></div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
